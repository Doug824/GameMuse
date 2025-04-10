import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <header className="mb-8">
            <div className="flex items-center justify-center md:justify-start">
                <Link to="/" className="inline-flex items-center group">
                    <h1 className="text-3xl font-bold">
                        <span className="text-gold group-hover:text-ethereal transition-colors duration-300">Game</span>
                        <span className="text-moonlight">Muse</span>
                    </h1>
                </Link>
            </div>
            {isHome && (
                <p className="text-tan text-center md:text-left mt-1">Discover your next favorite game</p>
            )}
        </header>
    );
};

export default Header;