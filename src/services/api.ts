import axios, { AxiosRequestConfig } from 'axios';

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

// Add the API key to every request
api.interceptors.request.use((config: AxiosRequestConfig) => {
    if (!config.params) {
        config.params = {};
    }
    config.params.key = import.meta.env.VITE_RAWG_API_KEY;
    return config;
});

// API functions
export const searchGames = async (query: string, filters: FilterOptions = {}): Promise<APIResponse<Game>> => {
    try {
        const { data } = await api.get<APIResponse<Game>>('/games', {
        params: {
            search: query,
            page_size: 20,
            ...filters,
        },
        });
        return data;
    } catch (error) {
        console.error('Error searching games:', error);
        throw error;
    }
};

export const getGameDetails = async (gameId: number | string): Promise<Game> => {
    try {
        const { data } = await api.get<Game>(`/games/${gameId}`);
        return data;
    } catch (error) {
        console.error('Error fetching game details:', error);
        throw error;
    }
};

export const getGameScreenshots = async (gameId: number | string): Promise<APIResponse<Screenshot>> => {
    try {
        const { data } = await api.get<APIResponse<Screenshot>>(`/games/${gameId}/screenshots`);
        return data;
    } catch (error) {
        console.error('Error fetching game screenshots:', error);
        throw error;
    }
};

export const getSimilarGames = async (gameId: number | string): Promise<APIResponse<Game>> => {
    try {
        const { data } = await api.get<APIResponse<Game>>(`/games/${gameId}/suggested`);
        return data;
    } catch (error) {
        console.error('Error fetching similar games:', error);
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