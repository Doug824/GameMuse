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

    // Popular games to show on initial load
    useEffect(() => {
        const fetchPopularGames = async () => {
        try {
            setLoading(true);
            const data = await searchGames('', { 
            ordering: '-metacritic', 
            page_size: 20 
            });
            setGames(data.results || []);
            setNoResults(data.results?.length === 0);
        } catch (error) {
            console.error('Error fetching popular games:', error);
        } finally {
            setLoading(false);
        }
        };

        fetchPopularGames();
    }, []);

    const handleSearch = async (query: string) => {
        try {
        setSearchQuery(query);
        setLoading(true);
        const data = await searchGames(query, filters);
        setGames(data.results || []);
        setNoResults(data.results?.length === 0);
        } catch (error) {
        console.error('Error searching games:', error);
        } finally {
        setLoading(false);
        }
    };

    const handleFilterChange = async (newFilters: FilterOptions) => {
        try {
        setFilters(newFilters);
        setLoading(true);
        
        const data = await searchGames(searchQuery, newFilters);
        setGames(data.results || []);
        setNoResults(data.results?.length === 0);
        } catch (error) {
        console.error('Error applying filters:', error);
        } finally {
        setLoading(false);
        }
    };

    const handleGameSelect = (gameId: number) => {
        navigate(`/game/${gameId}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
            <span className="text-purple-500">Game</span>Muse
            </h1>
            <p className="text-gray-400">Discover your next favorite game</p>
        </div>
        
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
            
            {noResults && !loading && (
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