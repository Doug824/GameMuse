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
    [key: string]: string | number | undefined;
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
        const { data } = await api.get<APIResponse<Game>>(`/games/${gameId}/suggested`);
        return data;
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