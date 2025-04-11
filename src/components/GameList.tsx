import React from 'react';
import GameCard from './GameCard';
import { Game } from '../services/api';

interface GameListProps {
    games: Game[];
    onGameSelect: (gameId: number) => void;
    loading: boolean;
}

const GameList: React.FC<GameListProps> = ({ games, onGameSelect, loading }) => {
    if (loading) {
        return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg animate-pulse">
                <div className="w-full h-48 bg-gray-700"></div>
                <div className="p-4">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
            ))}
        </div>
        );
    }

    if (games.length === 0) {
        return (
        <div className="text-center py-12 bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg">
            <h3 className="text-xl font-semibold text-gray-400">No games found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game) => (
            <GameCard
            key={game.id}
            game={game}
            onClick={onGameSelect}
            />
        ))}
        </div>
    );
};

export default GameList;