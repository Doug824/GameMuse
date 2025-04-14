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
        // Show a responsive loading skeleton grid
        return (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 animate-pulse">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                        <div className="w-full h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 bg-gray-700"></div>
                        <div className="p-3 sm:p-4">
                            <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-2/4 mb-2"></div>
                            <div className="flex gap-2">
                                <div className="h-4 bg-gray-700 rounded w-16"></div>
                                <div className="h-4 bg-gray-700 rounded w-16"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (games.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {games.map(game => (
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