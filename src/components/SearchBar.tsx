import React, { useState, useEffect } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    initialQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialQuery = '' }) => {
    const [query, setQuery] = useState<string>(initialQuery);
    
    // Update local state when initialQuery changes
    useEffect(() => {
        if (initialQuery) {
            setQuery(initialQuery);
        }
    }, [initialQuery]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-full sm:max-w-2xl mx-auto">
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for games..."
                    className="w-full px-4 py-3 sm:py-3 pr-12 text-base text-gray-200 bg-gray-800 bg-opacity-90 backdrop-blur-sm border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    aria-label="Search"
                />
                <button
                    type="submit"
                    className="absolute right-2 p-2 text-gray-400 hover:text-white transition"
                    aria-label="Search"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>
        </form>
    );
};

export default SearchBar;