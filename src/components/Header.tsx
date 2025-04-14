import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Login from './Login';

const Header: React.FC = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="mb-4 sm:mb-8 card-fantasy p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
                <Link to="/" className="inline-flex items-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        <span className="text-fae">Game</span>Muse
                    </h1>
                </Link>
                
                {/* Mobile menu button */}
                <div className="md:hidden">
                    <button 
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        className="p-2 text-white focus:outline-none focus:ring-2 focus:ring-fae rounded-md"
                    >
                        {menuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
                
                {/* Desktop menu */}
                <div className="hidden md:flex items-center space-x-4">
                    <Link 
                        to="/" 
                        className={`px-4 py-2 text-gray-300 hover:text-white transition ${isHome ? 'text-white' : ''}`}
                    >
                        Home
                    </Link>
                    <Login />
                </div>
            </div>
            
            {/* Mobile menu dropdown */}
            {menuOpen && (
                <div className="mt-3 py-2 border-t border-gray-700 md:hidden">
                    <Link 
                        to="/" 
                        className={`block py-2 px-1 ${isHome ? 'text-white' : 'text-gray-300'}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <div className="py-2">
                        <Login />
                    </div>
                </div>
            )}
            
            {isHome && (
                <p className="text-gray-300 text-center md:text-left mt-2 text-sm sm:text-base">
                    Discover your next favorite game
                </p>
            )}
        </header>
    );
};

export default Header;