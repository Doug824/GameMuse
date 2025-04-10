import axios, { InternalAxiosRequestConfig } from 'axios';

// Define types for API responses
export interface Game {
    id: number;
    name: string;
    background_image: string | null;
    released: string | null;
    metacritic: number | null;
    genres: Genre[];
    platforms?: { platform: Platform }[];
    description?: string;
    description_raw?: string;
    website?: string;
    developers?: Developer[];
    publishers?: Publisher[];
    esrb_rating?: ESRBRating;
    tags?: Tag[];
}

export interface Genre {
    id: number;
    name: string;
    slug: string;
}

export interface Platform {
    id: number;
    name: string;
    slug: string;
}

export interface Developer {
    id: number;
    name: string;
}

export interface Publisher {
    id: number;
    name: string;
}

export interface ESRBRating {
    id: number;
    name: string;
    slug: string;
}

export interface Screenshot {
    id: number;
    image: string;
    width: number;
    height: number;
}

export interface APIResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface FilterOptions {
    genres?: string;
    platforms?: string;
    ordering?: string;
    dates?: string;
    page_size?: number;
    page?: number;
    tags?: string;               
    metacritic?: string;         
    exclude_additions?: string;  
    exclude_parents?: string;    
    exclude_game_series?: string;
    [key: string]: string | number | undefined;
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
}

// Create an axios instance with the base URL for RAWG API
const api = axios.create({
    baseURL: 'https://api.rawg.io/api',
});

// Add the API key to every request with better error handling
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (!config.params) {
        config.params = {};
    }
    
    // Check if API key exists and log appropriately
    const apiKey = import.meta.env.VITE_RAWG_API_KEY;
    
    if (!apiKey) {
        console.error('⚠️ API KEY IS MISSING! Please check your .env file');
        console.log('Make sure you have a .env file in your project root with:');
        console.log('VITE_RAWG_API_KEY=your_api_key_here');
        
        // Attempt the request, but it will likely fail
        // Debugging by showing the exact request that's failing
    }
    
    config.params.key = apiKey;
    
    // Debug log the request
    if (import.meta.env.DEV) {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, 
            config.params ? `with params: ${JSON.stringify(config.params)}` : '');
    }
    
    return config;
});

// API functions with improved error handling
export const searchGames = async (query: string, filters: FilterOptions = {}): Promise<APIResponse<Game>> => {
    try {
        console.log(`Searching for games with query: "${query}"`);
        
        const { data } = await api.get<APIResponse<Game>>('/games', {
            params: {
                search: query,
                page_size: 20,
                ...filters,
            },
        });
        
        console.log(`Found ${data.results.length} games matching "${query}"`);
        return data;
    } catch (error) {
        console.error('Error searching games:', error);
        
        if (axios.isAxiosError(error)) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error(`API Error: ${error.response.status}`, error.response.data);
                
                if (error.response.status === 401) {
                    console.error('API KEY INVALID: Please check your RAWG API key');
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received from API:', error.request);
            }
        }
        
        // Re-throw the error so components can handle it
        throw error;
    }
};

export const getGameDetails = async (gameId: number | string): Promise<Game> => {
    try {
        const { data } = await api.get<Game>(`/games/${gameId}`);
        return data;
    } catch (error) {
        console.error(`Error fetching details for game ID ${gameId}:`, error);
        throw error;
    }
};

export const getGameScreenshots = async (gameId: number | string): Promise<APIResponse<Screenshot>> => {
    try {
        const { data } = await api.get<APIResponse<Screenshot>>(`/games/${gameId}/screenshots`);
        return data;
    } catch (error) {
        console.error(`Error fetching screenshots for game ID ${gameId}:`, error);
        throw error;
    }
};

export const getSimilarGames = async (gameId: number | string): Promise<APIResponse<Game>> => {
    try {
        // First try the 'suggested' endpoint - this is RAWG's built-in similarity algorithm
        try {
            const { data } = await api.get<APIResponse<Game>>(`/games/${gameId}/suggested`);
            if (data && data.results && data.results.length > 0) {
                console.log(`Found ${data.results.length} suggested games from API`);
                return data;
            }
        } catch {
            console.log('Suggested games endpoint failed');
        }
        
        // If suggested games fails, try the game-series endpoint
        try {
            const { data } = await api.get<APIResponse<Game>>(`/games/${gameId}/game-series`);
            if (data && data.results && data.results.length > 0) {
                console.log(`Found ${data.results.length} games in the same series`);
                return data;
            }
        } catch {
            console.log('Game series endpoint failed');
        }
        
        // If both quick methods fail, do a more sophisticated search based on the game's attributes
        // Get the detailed game info first
        const gameDetails = await getGameDetails(gameId);
        
        // Build a sophisticated search query based on multiple game attributes
        const searchParams: FilterOptions = {
            page_size: 10,
            exclude_additions: "true",
            exclude_parents: "false",
            exclude_game_series: "false",
        };
        
        // Use the game's genres for similarity matching
        if (gameDetails.genres && gameDetails.genres.length > 0) {
            // Use up to 2 genres for better specificity
            const genreIds = gameDetails.genres.slice(0, 2).map(g => g.id);
            searchParams.genres = genreIds.join(',');
        }
        
        // Add platforms for more similarity
        if (gameDetails.platforms && gameDetails.platforms.length > 0) {
            const platformIds = gameDetails.platforms.slice(0, 3).map(p => p.platform.id);
            searchParams.platforms = platformIds.join(',');
        }
        
        // Consider the game's tags, if available
        if (gameDetails.tags && gameDetails.tags.length > 0) {
            const tagIds = gameDetails.tags.slice(0, 3).map(t => t.id);
            searchParams.tags = tagIds.join(',');
        }
        
        // Consider similar metacritic scores for quality matching
        if (gameDetails.metacritic) {
            // Find games with similar review scores (within 10 points)
            const minScore = Math.max(0, gameDetails.metacritic - 10);
            const maxScore = Math.min(100, gameDetails.metacritic + 10);
            searchParams.metacritic = `${minScore},${maxScore}`;
        }
        
        // Find games from a similar time period
        if (gameDetails.released) {
            const releaseDate = new Date(gameDetails.released);
            const releaseYear = releaseDate.getFullYear();
            
            // Find games within a 3-year window
            const startYear = releaseYear - 1;
            const endYear = releaseYear + 1;
            searchParams.dates = `${startYear}-01-01,${endYear}-12-31`;
        }
        
        // Execute the search with our carefully constructed parameters
        const { data } = await api.get<APIResponse<Game>>('/games', { params: searchParams });
        
        // Filter out the original game from the results
        let results = data.results.filter(game => game.id !== Number(gameId));
        
        // If we get too many results, prioritize games with the most attribute matches
        if (results.length > 6) {
            // Sort by most relevant (most attribute matches with the original game)
            results = results.slice(0, 6);
        }
        
        if (results.length > 0) {
            console.log(`Found ${results.length} similar games based on game attributes`);
            return {
                count: results.length,
                results,
                next: null,
                previous: null
            };
        }
        
        // Last resort fallback - just find popular games in the primary genre
        if (gameDetails.genres && gameDetails.genres.length > 0) {
            const primaryGenre = gameDetails.genres[0].id;
            const { data } = await api.get<APIResponse<Game>>('/games', {
                params: {
                    genres: primaryGenre,
                    ordering: '-rating',
                    page_size: 6
                }
            });
            
            const genreResults = data.results.filter(game => game.id !== Number(gameId));
            if (genreResults.length > 0) {
                console.log(`Found ${genreResults.length} games in the same genre as last resort`);
                return {
                    count: genreResults.length,
                    results: genreResults,
                    next: null,
                    previous: null
                };
            }
        }
        
        // If all methods fail, return an empty response
        return { count: 0, results: [], next: null, previous: null };
    } catch (error) {
        console.error(`Error fetching similar games for game ID ${gameId}:`, error);
        throw error;
    }
};

export const getGenres = async (): Promise<APIResponse<Genre>> => {
    try {
        const { data } = await api.get<APIResponse<Genre>>('/genres');
        return data;
    } catch (error) {
        console.error('Error fetching genres:', error);
        throw error;
    }
};

export const getPlatforms = async (): Promise<APIResponse<Platform>> => {
    try {
        const { data } = await api.get<APIResponse<Platform>>('/platforms');
        return data;
    } catch (error) {
        console.error('Error fetching platforms:', error);
        throw error;
    }
};

export default api;