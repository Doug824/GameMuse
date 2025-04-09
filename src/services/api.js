import axios from 'axios';

// Create an axios instance with the base URL for RAWG API
const api = axios.create({
    baseURL: 'https://api.rawg.io/api',
});

// Add the API key to every request
api.interceptors.request.use((config) => {
    config.params = {
        ...config.params,
        key: import.meta.env.VITE_RAWG_API_KEY,
    };
    return config;
});

// API functions
export const searchGames = async (query, filters = {}) => {
    try {
        const { data } = await api.get('/games', {
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

export const getGameDetails = async (gameId) => {
    try {
        const { data } = await api.get(`/games/${gameId}`);
        return data;
    } catch (error) {
        console.error('Error fetching game details:', error);
        throw error;
    }
};

export const getGameScreenshots = async (gameId) => {
    try {
        const { data } = await api.get(`/games/${gameId}/screenshots`);
        return data;
    } catch (error) {
        console.error('Error fetching game screenshots:', error);
        throw error;
    }
};

export const getSimilarGames = async (gameId) => {
    try {
        const { data } = await api.get(`/games/${gameId}/suggested`);
        return data;
    } catch (error) {
        console.error('Error fetching similar games:', error);
        throw error;
    }
};

export const getGenres = async () => {
    try {
        const { data } = await api.get('/genres');
        return data;
    } catch (error) {
        console.error('Error fetching genres:', error);
        throw error;
    }
};

export const getPlatforms = async () => {
    try {
        const { data } = await api.get('/platforms');
        return data;
    } catch (error) {
        console.error('Error fetching platforms:', error);
        throw error;
    }
};

export default api;