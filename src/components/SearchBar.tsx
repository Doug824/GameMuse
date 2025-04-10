import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState<string>('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for games..."
                    className="w-full px-5 py-3 pr-12 text-mist bg-fog bg-opacity-80 
                            border border-forest focus:border-gold rounded-lg 
                            shadow-md backdrop-blur-sm
                            focus:outline-none focus:ring-2 focus:ring-gold/50
                            placeholder-tan/70 transition-all duration-300"
                />
                <button
                    type="submit"
                    className="absolute right-2 p-2 text-tan hover:text-gold transition-colors duration-300"
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