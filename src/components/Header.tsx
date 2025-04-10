import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <header className="mb-8">
        <div className="flex items-center justify-center md:justify-start">
            <Link to="/" className="inline-flex items-center">
            <h1 className="text-3xl font-bold text-white">
                <span className="text-purple-500">Game</span>Kindle
            </h1>
            </Link>
        </div>
        {isHome && (
            <p className="text-gray-400 text-center md:text-left">Discover your next favorite game</p>
        )}
        </header>
    );
};

export default Header;