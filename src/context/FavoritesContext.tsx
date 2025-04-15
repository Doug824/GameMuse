import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
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

    export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
    const [favorites, setFavorites] = useState<Game[]>([]);

    // Load favorites from localStorage on initial render
    useEffect(() => {
        const storedFavorites = localStorage.getItem('gameMuseFavorites');
        if (storedFavorites) {
        try {
            setFavorites(JSON.parse(storedFavorites));
        } catch (error) {
            console.error('Error parsing favorites from localStorage:', error);
            localStorage.removeItem('gameMuseFavorites');
        }
        }
    }, []);

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('gameMuseFavorites', JSON.stringify(favorites));
    }, [favorites]);

    // Add a game to favorites
    const addFavorite = (game: Game) => {
        setFavorites((prevFavorites) => {
        // Check if game is already in favorites to avoid duplicates
        const exists = prevFavorites.some((fav) => fav.id === game.id);
        if (exists) return prevFavorites;
        return [...prevFavorites, game];
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