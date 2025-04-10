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
        
        // If suggested games fails, try the game-series endpoint (sequels, prequels)
        try {
            const { data } = await api.get<APIResponse<Game>>(`/games/${gameId}/game-series`);
            if (data && data.results && data.results.length > 0) {
                console.log(`Found ${data.results.length} games in the same series`);
                return data;
            }
        } catch {
            console.log('Game series endpoint failed');
        }
        
        // Get the full details of the current game to base our search on
        console.log(`Getting full details for game ${gameId} to find true gameplay similarities`);
        const gameDetails = await getGameDetails(gameId);
        
        // Step 1: Get a wider set of candidate games based on primary genre
        // We'll filter these more precisely later
        const candidates: Game[] = [];
        
        // First, get games in the same primary genre(s)
        if (gameDetails.genres && gameDetails.genres.length > 0) {
            const primaryGenreId = gameDetails.genres[0].id;
            const secondaryGenreId = gameDetails.genres.length > 1 ? gameDetails.genres[1].id : null;
            
            const genreQuery = secondaryGenreId 
                ? `${primaryGenreId},${secondaryGenreId}` 
                : primaryGenreId.toString();
                
            const { data: genreGames } = await api.get<APIResponse<Game>>('/games', {
                params: {
                    genres: genreQuery,
                    page_size: 50, // Get a larger set to filter
                    ordering: '-rating' // Get higher quality games first
                }
            });
            
            candidates.push(...genreGames.results);
            console.log(`Found ${genreGames.results.length} games in the same genre(s)`);
        }
        
        // Also search by game name to find similar word patterns
        // This helps find games with similar themes in their titles
        const nameWords = gameDetails.name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(' ')
            .filter(word => word.length > 3); // Only use meaningful words
        
        if (nameWords.length > 0) {
            for (const word of nameWords.slice(0, 2)) { // Use at most 2 meaningful words
                try {
                    const { data: nameSearchGames } = await api.get<APIResponse<Game>>('/games', {
                        params: {
                            search: word,
                            page_size: 20
                        }
                    });
                    candidates.push(...nameSearchGames.results);
                    console.log(`Found ${nameSearchGames.results.length} games containing "${word}" in name`);
                } catch {
                    // Ignore failures on name search
                }
            }
        }
        
        // De-duplicate candidates
        const uniqueCandidates = Array.from(
            new Map(candidates.map(game => [game.id, game])).values()
        );
        
        // Remove the current game from candidates
        const filteredCandidates = uniqueCandidates.filter(game => 
            game.id !== Number(gameId)
        );
        
        console.log(`Total unique candidate games: ${filteredCandidates.length}`);
        
        // Step 2: Score each candidate by similarity to the current game
        const scoredCandidates = filteredCandidates.map(candidate => {
            let score = 0;
            
            // Genre match (highest weight)
            if (gameDetails.genres && candidate.genres) {
                for (const genre of gameDetails.genres) {
                    if (candidate.genres.some(g => g.id === genre.id)) {
                        score += 30;
                    }
                }
            }
            
            // Platform match
            if (gameDetails.platforms && candidate.platforms) {
                for (const platform of gameDetails.platforms) {
                    if (candidate.platforms.some(p => p.platform.id === platform.platform.id)) {
                        score += 10;
                    }
                }
            }
            
            // Tag match (very important for gameplay style)
            if (gameDetails.tags && candidate.tags) {
                for (const tag of gameDetails.tags) {
                    if (candidate.tags.some(t => t.id === tag.id)) {
                        score += 20;
                    }
                }
            }
            
            // Similar metacritic score (quality match)
            if (gameDetails.metacritic && candidate.metacritic) {
                const scoreDiff = Math.abs(gameDetails.metacritic - candidate.metacritic);
                if (scoreDiff < 5) score += 15;
                else if (scoreDiff < 10) score += 10;
                else if (scoreDiff < 15) score += 5;
            }
            
            // Release year proximity
            if (gameDetails.released && candidate.released) {
                const yearA = new Date(gameDetails.released).getFullYear();
                const yearB = new Date(candidate.released).getFullYear();
                const yearDiff = Math.abs(yearA - yearB);
                
                if (yearDiff < 2) score += 10;
                else if (yearDiff < 4) score += 5;
            }
            
            // Bonus for sequel/prequel naming pattern
            if (gameDetails.name && candidate.name) {
                const nameA = gameDetails.name.toLowerCase();
                const nameB = candidate.name.toLowerCase();
                
                // Check for sequels/prequels by looking for number patterns
                if (nameB.includes(nameA) || nameA.includes(nameB)) {
                    score += 25;
                }
                
                // Check for same franchise different subtitles
                const baseNameA = nameA.split(':')[0].trim();
                const baseNameB = nameB.split(':')[0].trim();
                
                if (baseNameA === baseNameB && nameA !== nameB) {
                    score += 20;
                }
            }
            
            return { game: candidate, score };
        });
        
        // Sort by similarity score (highest first)
        scoredCandidates.sort((a, b) => b.score - a.score);
        
        // Take top results (max 6)
        const topResults = scoredCandidates
            .filter(item => item.score > 30) // Only include games with meaningful similarity
            .slice(0, 6)
            .map(item => item.game);
            
        console.log(`Final similar games count: ${topResults.length}`);
        
        if (topResults.length > 0) {
            return {
                count: topResults.length,
                results: topResults,
                next: null,
                previous: null
            };
        }
        
        // If all else fails, try a simple genre + platform query as last resort
        console.log('Using last resort method to find similar games');
        if (gameDetails.genres && gameDetails.genres.length > 0 && gameDetails.platforms && gameDetails.platforms.length > 0) {
            const mainGenre = gameDetails.genres[0].id;
            const mainPlatform = gameDetails.platforms[0].platform.id;
            
            const { data } = await api.get<APIResponse<Game>>('/games', {
                params: {
                    genres: mainGenre.toString(),
                    platforms: mainPlatform.toString(),
                    ordering: '-rating',
                    page_size: 6
                }
            });
            
            const lastResortResults = data.results.filter(game => game.id !== Number(gameId));
            
            if (lastResortResults.length > 0) {
                return {
                    count: lastResortResults.length,
                    results: lastResortResults,
                    next: null,
                    previous: null
                };
            }
        }
        
        // If everything fails, return empty results
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