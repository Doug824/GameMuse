// Updated Home.tsx - Remove the title since it's now in the Header component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchGames, Game, FilterOptions } from '../services/api';
import SearchBar from '../components/SearchBar';
import GameList from '../components/GameList';
import Filters from '../components/Filters';
import Favorites from '../components/Favorites';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filters, setFilters] = useState<FilterOptions>({});
    const [noResults, setNoResults] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);

    // Check if API key is configured
    useEffect(() => {
        const apiKey = import.meta.env.VITE_RAWG_API_KEY;
        if (!apiKey) {
            setIsApiKeyMissing(true);
            setError('API key is missing. Please configure your .env file with a valid RAWG API key.');
        }
    }, []);

    // Popular games to show on initial load
    useEffect(() => {
        const fetchPopularGames = async () => {
            // Skip if API key is missing
            if (isApiKeyMissing) return;
            
            try {
                setLoading(true);
                setError(null);
                const data = await searchGames('', { 
                    ordering: '-metacritic', 
                    page_size: 20 
                });
                setGames(data.results || []);
                setNoResults(data.results?.length === 0);
            } catch (error) {
                console.error('Error fetching popular games:', error);
                setError('Failed to load popular games. Please check your API key and connection.');
                setGames([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularGames();
    }, [isApiKeyMissing]);

    const handleSearch = async (query: string) => {
        // Don't attempt search if API key is missing
        if (isApiKeyMissing) {
            setError('Cannot search: API key is missing. Please configure your .env file.');
            return;
        }
        
        try {
            setSearchQuery(query);
            setLoading(true);
            setError(null);
            
            console.log(`Searching for: "${query}" with filters:`, filters);
            const data = await searchGames(query, filters);
            
            setGames(data.results || []);
            setNoResults(data.results?.length === 0);
            
            console.log(`Search complete. Found ${data.results?.length || 0} results.`);
        } catch (error) {
            console.error('Error searching games:', error);
            setError('Failed to search games. Please check your connection and try again.');
            setGames([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = async (newFilters: FilterOptions) => {
        // Don't attempt filtering if API key is missing
        if (isApiKeyMissing) {
            setError('Cannot apply filters: API key is missing. Please configure your .env file.');
            return;
        }
        
        try {
            setFilters(newFilters);
            setLoading(true);
            setError(null);
            
            const data = await searchGames(searchQuery, newFilters);
            setGames(data.results || []);
            setNoResults(data.results?.length === 0);
        } catch (error) {
            console.error('Error applying filters:', error);
            setError('Failed to apply filters. Please try again.');
            setGames([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGameSelect = (gameId: number) => {
        navigate(`/game/${gameId}`);
    };

    return (
        <div>
            {/* Error banner */}
            {error && (
                <div className="bg-red-900 text-red-200 p-4 rounded-lg shadow-lg mb-6">
                    <h3 className="font-semibold mb-1">Error</h3>
                    <p>{error}</p>
                    {isApiKeyMissing && (
                        <div className="mt-2 text-sm">
                            <p className="font-semibold">How to fix:</p>
                            <ol className="list-decimal list-inside ml-2 mt-1">
                                <li>Get a free API key from <a href="https://rawg.io/apidocs" target="_blank" rel="noopener noreferrer" className="underline">RAWG API</a></li>
                                <li>Create a <code className="bg-red-800 px-1 rounded">.env</code> file in your project root</li>
                                <li>Add <code className="bg-red-800 px-1 rounded">VITE_RAWG_API_KEY=your_api_key_here</code></li>
                                <li>Restart your development server</li>
                            </ol>
                        </div>
                    )}
                </div>
            )}
            
            <SearchBar onSearch={handleSearch} />
            
            <div className="mt-8">
                <Favorites onGameSelect={handleGameSelect} />
                
                <Filters onFilterChange={handleFilterChange} />
                
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-white">
                        {searchQuery 
                        ? `Results for "${searchQuery}"` 
                        : 'Popular Games'}
                        {!loading && games.length > 0 && (
                        <span className="text-gray-400 text-sm ml-2">({games.length} games)</span>
                        )}
                    </h2>
                </div>
                
                <GameList 
                    games={games} 
                    onGameSelect={handleGameSelect} 
                    loading={loading} 
                />
                
                {noResults && !loading && !error && (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold text-gray-400">No games found</h3>
                        <p className="text-gray-500 mt-2">Try a different search or adjust your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;