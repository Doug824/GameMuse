import React, { useState, useEffect } from 'react';
import { Game, searchGames, FilterOptions, getGameDetails } from '../services/api';
import { useFavorites } from '../context/FavoritesContext';
import GameList from './GameList';

interface RecommendedGamesProps {
    onGameSelect: (gameId: number) => void;
}

const RecommendedGames: React.FC<RecommendedGamesProps> = ({ onGameSelect }) => {
    const { favorites } = useFavorites();
    const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            // Only fetch recommendations if we have favorites
            if (favorites.length === 0) {
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Collect tags and genres from favorites
                let genreCounts: Record<number, number> = {};
                let tagCounts: Record<number, number> = {};

                // Get detailed info for favorites if needed
                for (const favorite of favorites) {
                    // Count genres
                    if (favorite.genres) {
                        for (const genre of favorite.genres) {
                            genreCounts[genre.id] = (genreCounts[genre.id] || 0) + 1;
                        }
                    }

                    // Check if we need to fetch full details for this game
                    if (!favorite.tags) {
                        try {
                            const details = await getGameDetails(favorite.id);
                            
                            // Count tags
                            if (details.tags) {
                                for (const tag of details.tags) {
                                    tagCounts[tag.id] = (tagCounts[tag.id] || 0) + 1;
                                }
                            }
                        } catch (error) {
                            console.error(`Error fetching details for favorite game ${favorite.id}:`, error);
                        }
                    } else {
                        // Count tags directly if available
                        for (const tag of favorite.tags) {
                            tagCounts[tag.id] = (tagCounts[tag.id] || 0) + 1;
                        }
                    }
                }

                // Sort genres and tags by frequency
                const topGenres = Object.entries(genreCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(entry => entry[0]);

                const topTags = Object.entries(tagCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(entry => entry[0]);

                // Create filter options
                const filterOptions: FilterOptions = {
                    page_size: 6,
                    ordering: '-rating' // Get highest rated games
                };

                // Add genres if we have them
                if (topGenres.length > 0) {
                    filterOptions.genres = topGenres.join(',');
                }

                // Add tags if we have them
                if (topTags.length > 0) {
                    filterOptions.tags = topTags.join(',');
                }

                // Fetch recommended games
                const response = await searchGames('', filterOptions);

                // Filter out games that are already in favorites
                const favIds = favorites.map(fav => fav.id);
                const filteredRecommendations = response.results.filter(
                    game => !favIds.includes(game.id)
                );

                setRecommendedGames(filteredRecommendations);
            } catch (error) {
                console.error('Error fetching recommended games:', error);
                setError('Could not load recommendations');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [favorites]);

    // Don't render anything if there are no favorites or recommendations
    if (favorites.length === 0 || (recommendedGames.length === 0 && !loading && !error)) {
        return null;
    }

    return (
        <div className="mb-6">
            <div className="mb-4 card-fantasy p-3 rounded-lg">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                    Recommended Games For You
                    {!loading && recommendedGames.length > 0 && (
                        <span className="text-gray-300 text-sm ml-2">({recommendedGames.length} games)</span>
                    )}
                </h2>
                <p className="text-sm text-gray-300">Based on your favorite games</p>
            </div>

            {error && (
                <div className="bg-red-900 bg-opacity-75 p-3 rounded-lg text-red-200 mb-4">
                    {error}
                </div>
            )}

            <GameList
                games={recommendedGames}
                onGameSelect={onGameSelect}
                loading={loading}
            />
        </div>
    );
};

export default RecommendedGames;