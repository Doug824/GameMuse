import React, { useState, useEffect } from 'react';
import { getGenres, getPlatforms, Genre, Platform, FilterOptions } from '../services/api';

interface FiltersProps {
    onFilterChange: (filters: FilterOptions) => void;
    initialFilters?: FilterOptions;
}

interface FilterState {
    genres: string[];
    platforms: string[];
    ordering: string;
    dates: string;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange, initialFilters = {} }) => {
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    // Convert initialFilters to our internal state format
    const initialFilterState: FilterState = {
        genres: initialFilters.genres ? initialFilters.genres.split(',') : [],
        platforms: initialFilters.platforms ? initialFilters.platforms.split(',') : [],
        ordering: initialFilters.ordering || '',
        dates: initialFilters.dates || ''
    };
    
    const [filters, setFilters] = useState<FilterState>(initialFilterState);

    // Mobile optimization: track if advanced filters are shown
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

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

    // Update filters when initialFilters changes
    useEffect(() => {
        const newFilterState: FilterState = {
            genres: initialFilters.genres ? initialFilters.genres.split(',') : [],
            platforms: initialFilters.platforms ? initialFilters.platforms.split(',') : [],
            ordering: initialFilters.ordering || '',
            dates: initialFilters.dates || ''
        };
        
        setFilters(newFilterState);
    }, [initialFilters]);

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
        if (!showFilters) {
            // Reset advanced filters view when opening
            setShowAdvancedFilters(false);
        }
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

    // Count active filters for mobile display
    const activeFilterCount = 
        filters.genres.length + 
        filters.platforms.length + 
        (filters.ordering ? 1 : 0) + 
        (filters.dates ? 1 : 0);

    return (
        <div className="mb-4 sm:mb-6 bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg p-3 sm:p-4 shadow-md">
            <div className="flex justify-between items-center">
                <button 
                    onClick={toggleFilters}
                    className="flex items-center text-purple-400 hover:text-purple-300 transition p-2"
                    aria-expanded={showFilters}
                    aria-controls="filter-panel"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    <span className="sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-purple-700 text-xs rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
                
                {activeFilterCount > 0 && (
                    <button 
                        onClick={clearFilters}
                        className="text-gray-400 hover:text-white text-sm transition p-2"
                    >
                        Clear All
                    </button>
                )}
            </div>
            
            {showFilters && (
                <div id="filter-panel" className="mt-3 space-y-4">
                    {/* Primary filters always visible */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Ordering */}
                        <div>
                            <label htmlFor="ordering" className="block text-gray-300 text-sm font-medium mb-1">Sort By</label>
                            <select
                                id="ordering"
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
                            <label htmlFor="dates" className="block text-gray-300 text-sm font-medium mb-1">Release Period</label>
                            <select
                                id="dates"
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
                    </div>
                    
                    {/* Toggle advanced filters button */}
                    <div className="pt-1">
                        <button 
                            type="button"
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="flex items-center text-sm text-gray-400 hover:text-white transition"
                        >
                            <span>{showAdvancedFilters ? 'Hide' : 'Show'} advanced filters</span>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`ml-1 h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Advanced filters - only shown when toggled */}
                    {showAdvancedFilters && (
                        <>
                            {/* Genres */}
                            <div>
                                <h3 className="text-gray-300 text-sm font-medium mb-2">Genres</h3>
                                {loading ? (
                                    <div className="flex flex-wrap gap-2 animate-pulse">
                                        {[...Array(6)].map((_, index) => (
                                            <div key={index} className="h-8 w-20 bg-gray-700 rounded"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {genres.slice(0, 12).map((genre) => (
                                            <button
                                                key={genre.id}
                                                onClick={() => handleFilterChange('genres', genre.id.toString())}
                                                className={`px-3 py-1 rounded-full text-sm transition ${
                                                    filters.genres.includes(genre.id.toString())
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                                style={{ minHeight: '32px' }} // Ensuring minimum touch target size
                                            >
                                                {genre.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Platforms */}
                            <div>
                                <h3 className="text-gray-300 text-sm font-medium mb-2">Platforms</h3>
                                {loading ? (
                                    <div className="flex flex-wrap gap-2 animate-pulse">
                                        {[...Array(6)].map((_, index) => (
                                            <div key={index} className="h-8 w-24 bg-gray-700 rounded"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {platforms.slice(0, 8).map((platform) => (
                                            <button
                                                key={platform.id}
                                                onClick={() => handleFilterChange('platforms', platform.id.toString())}
                                                className={`px-3 py-1 rounded-full text-sm transition ${
                                                    filters.platforms.includes(platform.id.toString())
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                                style={{ minHeight: '32px' }} // Ensuring minimum touch target size
                                            >
                                                {platform.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Filters;