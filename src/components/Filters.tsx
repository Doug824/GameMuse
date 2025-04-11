import React, { useState, useEffect } from 'react';
import { getGenres, getPlatforms, Genre, Platform, FilterOptions } from '../services/api';

interface FiltersProps {
    onFilterChange: (filters: FilterOptions) => void;
}

interface FilterState {
    genres: string[];
    platforms: string[];
    ordering: string;
    dates: string;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const [filters, setFilters] = useState<FilterState>({
        genres: [],
        platforms: [],
        ordering: '',
        dates: ''
    });

    useEffect(() => {
        const fetchFilters = async () => {
        try {
            setLoading(true);
            const [genresData, platformsData] = await Promise.all([
            getGenres(),
            getPlatforms()
            ]);
            setGenres(genresData.results || []);
            setPlatforms(platformsData.results || []);
        } catch (error) {
            console.error('Error fetching filters:', error);
        } finally {
            setLoading(false);
        }
        };

        fetchFilters();
    }, []);

    const handleFilterChange = (type: keyof FilterState, value: string) => {
        setFilters(prev => {
        let newFilters: FilterState;
        
        if (type === 'genres' || type === 'platforms') {
            // Toggle array values
            const array = [...prev[type]];
            const index = array.indexOf(value);
            
            if (index === -1) {
            array.push(value);
            } else {
            array.splice(index, 1);
            }
            
            newFilters = { ...prev, [type]: array };
        } else {
            // Direct assignment for other filters
            newFilters = { ...prev, [type]: value };
        }
        
        // Convert filter state to API parameters
        const apiParams: FilterOptions = {};
        
        if (newFilters.genres.length > 0) {
            apiParams.genres = newFilters.genres.join(',');
        }
        
        if (newFilters.platforms.length > 0) {
            apiParams.platforms = newFilters.platforms.join(',');
        }
        
        if (newFilters.ordering) {
            apiParams.ordering = newFilters.ordering;
        }
        
        if (newFilters.dates) {
            apiParams.dates = newFilters.dates;
        }
        
        onFilterChange(apiParams);
        return newFilters;
        });
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const clearFilters = () => {
        const resetFilters: FilterState = {
        genres: [],
        platforms: [],
        ordering: '',
        dates: ''
        };
        setFilters(resetFilters);
        onFilterChange({});
    };

    // Year ranges for filtering
    const yearRanges = [
        { label: 'All Time', value: '' },
        { label: '2023-2025', value: '2023-01-01,2025-12-31' },
        { label: '2020-2022', value: '2020-01-01,2022-12-31' },
        { label: '2015-2019', value: '2015-01-01,2019-12-31' },
        { label: '2010-2014', value: '2010-01-01,2014-12-31' },
        { label: 'Before 2010', value: '1980-01-01,2009-12-31' }
    ];

    // Ordering options
    const orderingOptions = [
        { label: 'Relevance', value: '' },
        { label: 'Name (A-Z)', value: 'name' },
        { label: 'Name (Z-A)', value: '-name' },
        { label: 'Release Date (Newest)', value: '-released' },
        { label: 'Release Date (Oldest)', value: 'released' },
        { label: 'Rating (Highest)', value: '-rating' },
        { label: 'Rating (Lowest)', value: 'rating' }
    ];

    return (
        <div className="mb-6 bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center mb-2">
            <button 
            onClick={toggleFilters}
            className="flex items-center text-purple-400 hover:text-purple-300 transition"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {(filters.genres.length > 0 || filters.platforms.length > 0 || filters.ordering || filters.dates) && (
            <button 
                onClick={clearFilters}
                className="text-gray-400 hover:text-white text-sm transition"
            >
                Clear All
            </button>
            )}
        </div>
        
        {showFilters && (
            <div className="mt-4 space-y-6">
            {/* Ordering */}
            <div>
                <h3 className="text-gray-300 font-medium mb-2">Sort By</h3>
                <select
                value={filters.ordering}
                onChange={(e) => handleFilterChange('ordering', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                {orderingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                    {option.label}
                    </option>
                ))}
                </select>
            </div>
            
            {/* Release Date Ranges */}
            <div>
                <h3 className="text-gray-300 font-medium mb-2">Release Period</h3>
                <select
                value={filters.dates}
                onChange={(e) => handleFilterChange('dates', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                {yearRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                    {range.label}
                    </option>
                ))}
                </select>
            </div>
            
            {/* Genres */}
            <div>
                <h3 className="text-gray-300 font-medium mb-2">Genres</h3>
                {loading ? (
                <div className="flex flex-wrap gap-2 animate-pulse">
                    {[...Array(8)].map((_, index) => (
                    <div key={index} className="h-8 w-20 bg-gray-700 rounded"></div>
                    ))}
                </div>
                ) : (
                <div className="flex flex-wrap gap-2">
                    {genres.slice(0, 15).map((genre) => (
                    <button
                        key={genre.id}
                        onClick={() => handleFilterChange('genres', genre.id.toString())}
                        className={`px-3 py-1 rounded-full text-sm transition ${
                        filters.genres.includes(genre.id.toString())
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        {genre.name}
                    </button>
                    ))}
                </div>
                )}
            </div>
            
            {/* Platforms */}
            <div>
                <h3 className="text-gray-300 font-medium mb-2">Platforms</h3>
                {loading ? (
                <div className="flex flex-wrap gap-2 animate-pulse">
                    {[...Array(8)].map((_, index) => (
                    <div key={index} className="h-8 w-24 bg-gray-700 rounded"></div>
                    ))}
                </div>
                ) : (
                <div className="flex flex-wrap gap-2">
                    {platforms.slice(0, 10).map((platform) => (
                    <button
                        key={platform.id}
                        onClick={() => handleFilterChange('platforms', platform.id.toString())}
                        className={`px-3 py-1 rounded-full text-sm transition ${
                        filters.platforms.includes(platform.id.toString())
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        {platform.name}
                    </button>
                    ))}
                </div>
                )}
            </div>
            </div>
        )}
        </div>
    );
};

export default Filters;