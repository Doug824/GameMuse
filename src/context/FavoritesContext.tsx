import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Game } from '../services/api';

interface FavoritesContextType {
    favorites: Game[];
    addFavorite: (game: Game) => void;
    removeFavorite: (gameId: number) => void;
    isFavorite: (gameId: number) => boolean;
}

interface FavoritesProviderProps {
    children: ReactNode;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = (): FavoritesContextType => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
    const [favorites, setFavorites] = useState<Game[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load favorites from localStorage on initial render
    useEffect(() => {
        try {
            const storedFavorites = localStorage.getItem('gameMuseFavorites');
            if (storedFavorites) {
                try {
                    const parsedFavorites = JSON.parse(storedFavorites);
                    // Validate that parsedFavorites is actually an array
                    if (Array.isArray(parsedFavorites)) {
                        setFavorites(parsedFavorites);
                    } else {
                        console.error('Stored favorites is not an array, resetting to empty array');
                        localStorage.removeItem('gameMuseFavorites');
                        setFavorites([]);
                    }
                } catch (error) {
                    console.error('Error parsing favorites from localStorage:', error);
                    localStorage.removeItem('gameMuseFavorites');
                    setFavorites([]);
                }
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            setFavorites([]);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        // Only save after initial load to prevent potential loops
        if (isInitialized) {
            try {
                localStorage.setItem('gameMuseFavorites', JSON.stringify(favorites));
            } catch (error) {
                console.error('Error saving favorites to localStorage:', error);
            }
        }
    }, [favorites, isInitialized]);

    // Add a game to favorites
    const addFavorite = (game: Game) => {
        setFavorites((prevFavorites) => {
            // Check if game is already in favorites to avoid duplicates
            const exists = prevFavorites.some((fav) => fav.id === game.id);
            if (exists) return prevFavorites;
            
            // Create a safe copy of the game object with only necessary properties
            const gameCopy = {
                id: game.id,
                name: game.name,
                background_image: game.background_image,
                released: game.released,
                metacritic: game.metacritic,
                genres: game.genres ? [...game.genres] : [],
                platforms: game.platforms ? game.platforms.map(p => ({
                    platform: {
                        id: p.platform.id,
                        name: p.platform.name,
                        slug: p.platform.slug
                    }
                })) : undefined
            };
            
            return [...prevFavorites, gameCopy];
        });
    };

    // Remove a game from favorites
    const removeFavorite = (gameId: number) => {
        setFavorites((prevFavorites) => 
            prevFavorites.filter((game) => game.id !== gameId)
        );
    };

    // Check if a game is in favorites
    const isFavorite = (gameId: number): boolean => {
        return favorites.some((game) => game.id === gameId);
    };

    const value = {
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

export default FavoritesContext;