import { createContext, useState, useEffect, useContext } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);

    // Load favorites from localStorage on initial render
    useEffect(() => {
        const storedFavorites = localStorage.getItem('gameKindleFavorites');
        if (storedFavorites) {
        try {
            setFavorites(JSON.parse(storedFavorites));
        } catch (error) {
            console.error('Error parsing favorites from localStorage:', error);
            localStorage.removeItem('gameKindleFavorites');
        }
        }
    }, []);

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('gameKindleFavorites', JSON.stringify(favorites));
    }, [favorites]);

    // Add a game to favorites
    const addFavorite = (game) => {
        setFavorites((prevFavorites) => {
        // Check if game is already in favorites to avoid duplicates
        const exists = prevFavorites.some((fav) => fav.id === game.id);
        if (exists) return prevFavorites;
        return [...prevFavorites, game];
        });
    };

  // Remove a game from favorites
    const removeFavorite = (gameId) => {
        setFavorites((prevFavorites) => 
        prevFavorites.filter((game) => game.id !== gameId)
        );
    };

    // Check if a game is in favorites
    const isFavorite = (gameId) => {
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