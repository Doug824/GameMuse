import React, { useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import GameCard from './GameCard';

interface FavoritesProps {
onGameSelect: (gameId: number) => void;
}

const Favorites: React.FC<FavoritesProps> = ({ onGameSelect }) => {
    const { favorites } = useFavorites();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
        <button
            onClick={toggleOpen}
            className="w-full flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-700 transition"
        >
            <div className="flex items-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500 mr-2"
                fill="currentColor"
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
            <h2 className="text-lg font-semibold text-white">Your Favorites</h2>
            <span className="ml-2 px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                {favorites.length}
            </span>
            </div>
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
            </svg>
        </button>

        {isOpen && (
            <div className="p-4">
            {favorites.length === 0 ? (
                <div className="text-center py-8">
                <p className="text-gray-400">You haven't added any favorites yet.</p>
                <p className="text-gray-500 text-sm mt-1">
                    Heart the games you love to see them here!
                </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {favorites.map((game) => (
                    <GameCard
                    key={game.id}
                    game={game}
                    onClick={onGameSelect}
                    />
                ))}
                </div>
            )}
            </div>
        )}
    </div>
    );
};

export default Favorites;