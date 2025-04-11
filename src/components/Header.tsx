import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <header className="mb-8 card-fantasy p-4 rounded-lg">
            <div className="flex items-center justify-center md:justify-start">
                <Link to="/" className="inline-flex items-center">
                    <h1 className="text-3xl font-bold text-white">
                        <span className="text-fae">Game</span>Muse
                    </h1>
                </Link>
            </div>
            {isHome && (
                <p className="text-gray-300 text-center md:text-left">
                    Discover your next favorite game
                </p>
            )}
        </header>
    );
};

export default Header;