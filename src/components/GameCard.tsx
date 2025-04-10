import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { Game } from '../services/api';

interface GameCardProps {
    game: Game;
    onClick: (gameId: number) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const isGameFavorite = isFavorite(game.id);

    const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // Prevent triggering the card click event
        if (isGameFavorite) {
            removeFavorite(game.id);
        } else {
            addFavorite(game);
        }
    };

    // Format release date to just show the year
    const releaseYear = game.released ? new Date(game.released).getFullYear() : 'TBA';

    return (
        <div 
            className="bg-fog bg-opacity-90 rounded-lg overflow-hidden shadow-lg 
                    transition-all duration-300 hover:scale-105 
                    hover:shadow-gold/20 hover:shadow-lg
                    border border-forest/50 cursor-pointer"
            onClick={() => onClick(game.id)}
        >
            <div className="relative">
                <div className="h-48 overflow-hidden">
                    <img 
                        src={game.background_image || 'https://via.placeholder.com/300x150?text=No+Image'} 
                        alt={game.name} 
                        className="w-full h-48 object-cover transform transition-transform duration-500 hover:scale-110"
                    />
                </div>
                <button
                    onClick={handleFavoriteClick}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 
                              ${isGameFavorite 
                              ? 'bg-red-500 text-mist shadow-md shadow-red-500/20' 
                              : 'bg-fog/70 hover:bg-gold/80 text-tan hover:text-twilight backdrop-blur-sm'}`}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        fill={isGameFavorite ? "currentColor" : "none"} 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                    </svg>
                </button>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-mist mb-1 truncate">{game.name}</h3>
                <div className="flex justify-between items-center">
                    <span className="text-tan text-sm">{releaseYear}</span>
                    {game.metacritic && (
                        <span className={`px-2 py-1 text-xs rounded font-bold ${
                            game.metacritic >= 75 ? 'bg-emerald-900/70 text-emerald-200' :
                            game.metacritic >= 50 ? 'bg-gold/70 text-twilight' :
                            'bg-red-800/70 text-red-200'
                        }`}>
                            {game.metacritic}
                        </span>
                    )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                    {game.genres?.slice(0, 2).map((genre) => (
                        <span 
                            key={genre.id} 
                            className="px-2 py-1 bg-sage/30 border border-sage/40 rounded text-tan text-xs"
                        >
                            {genre.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GameCard;