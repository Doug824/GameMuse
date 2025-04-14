import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Login from './Login';

const Header: React.FC = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <header className="mb-8 card-fantasy p-4 rounded-lg">
            <div className="flex items-center justify-between">
                <Link to="/" className="inline-flex items-center">
                    <h1 className="text-3xl font-bold text-white">
                        <span className="text-fae">Game</span>Muse
                    </h1>
                </Link>
                
                <div className="flex items-center space-x-4">
                    <Link 
                        to="/" 
                        className={`hidden md:block px-4 py-2 text-gray-300 hover:text-white transition ${isHome ? 'text-white' : ''}`}
                    >
                        Home
                    </Link>
                    <Login />
                </div>
            </div>
            {isHome && (
                <p className="text-gray-300 text-center md:text-left mt-2">
                    Discover your next favorite game
                </p>
            )}
        </header>
    );
};

export default Header;