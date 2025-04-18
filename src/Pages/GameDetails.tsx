import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getGameDetails, getGameScreenshots, getSimilarGames, getGamesByDeveloper, Game, Screenshot } from '../services/api';
import { useFavorites } from '../context/FavoritesContext';
import GameList from '../components/GameList';
import Collections from '../components/Collections';

interface GameDetailsParams {
    id: string;
}

const GameDetails: React.FC = () => {
    const { id } = useParams<keyof GameDetailsParams>() as GameDetailsParams;
    const navigate = useNavigate();
    const location = useLocation();
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    
    // Get state from the location if available (from navigation)
    const locationState = location.state as {
        searchResults?: Game[];
        searchQuery?: string;
        filterOptions?: any;
    } | null;
    
    const [game, setGame] = useState<Game | null>(null);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [similarGames, setSimilarGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeImage, setActiveImage] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [fetchErrors, setFetchErrors] = useState<{[key: string]: string}>({});
    const [developerGames, setDeveloperGames] = useState<Game[]>([]);
    const [loadingDeveloperGames, setLoadingDeveloperGames] = useState<boolean>(false);
    const [showFullDescription, setShowFullDescription] = useState<boolean>(false);

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                setLoading(true);
                setError(null);
                setFetchErrors({});
                
                console.log(`Fetching details for game ID: ${id}`);
                
                // Fetch game details first
                let gameData: Game | null = null;
                
                try {
                    gameData = await getGameDetails(id);
                    console.log('Game details fetched successfully');
                    setGame(gameData);
                    
                    // Now fetch other data in parallel if we have game details
                    const [screenshotsResponse, similarGamesResponse] = await Promise.all([
                        getGameScreenshots(id).catch(error => {
                            console.error('Error fetching screenshots:', error);
                            setFetchErrors(prev => ({...prev, screenshots: 'Could not load screenshots'}));
                            return { results: [] };
                        }),
                        getSimilarGames(id).catch(error => {
                            console.error('Error fetching similar games:', error);
                            setFetchErrors(prev => ({...prev, similar: 'Could not load similar games'}));
                            return { results: [] };
                        })
                    ]);
                    
                    setScreenshots(screenshotsResponse.results || []);
                    setSimilarGames(similarGamesResponse.results || []);
                    
                    // Fetch games by the same developer if we have developer info
                    if (gameData.developers && gameData.developers.length > 0) {
                        setLoadingDeveloperGames(true);
                        try {
                            const primaryDeveloperId = gameData.developers[0].id;
                            const devGamesResponse = await getGamesByDeveloper(primaryDeveloperId);
                            
                            // Filter out the current game from developer games
                            const filteredDevGames = devGamesResponse.results.filter(
                                game => game.id !== Number(id)
                            );
                            
                            setDeveloperGames(filteredDevGames);
                        } catch (error) {
                            console.error('Error fetching developer games:', error);
                            setFetchErrors(prev => ({...prev, developer: 'Could not load developer games'}));
                        } finally {
                            setLoadingDeveloperGames(false);
                        }
                    }
                    
                } catch (error) {
                    console.error('Error fetching game details:', error);
                    setError('Failed to load game details. Please try again later.');
                }
            } catch (error) {
                console.error('Error in fetchGameData:', error);
                setError('Failed to load game details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchGameData();
        }
        
        // Reset the active image and description state when navigating between games
        setActiveImage(0);
        setShowFullDescription(false);
        
    }, [id]);

    const handleFavoriteToggle = () => {
        if (game) {
            if (isFavorite(game.id)) {
                removeFavorite(game.id);
            } else {
                addFavorite(game);
            }
        }
    };

    const handleSimilarGameSelect = (gameId: number) => {
        // When selecting a similar game, we want to preserve the original search state if it exists
        navigate(`/game/${gameId}`, { 
            state: locationState 
        });
    };

    // Handle back button click - preserve search state if available
    const handleBackClick = () => {
        if (locationState?.searchResults?.length) {
            // If we came from search results, pass back to home with the search state
            navigate('/', { state: locationState });
        } else {
            // Otherwise just go back to previous page
            navigate(-1);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-4 sm:py-8 animate-pulse">
                <div className="flex items-center mb-4">
                    <div className="h-6 w-16 bg-gray-700 rounded"></div>
                </div>
                <div className="h-56 sm:h-64 md:h-80 w-full bg-gray-700 rounded mb-4 sm:mb-8"></div>
                <div className="h-6 w-3/4 bg-gray-700 rounded mb-2"></div>
                <div className="h-6 w-1/2 bg-gray-700 rounded mb-2"></div>
                <div className="h-6 w-2/3 bg-gray-700 rounded"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-6 text-center">
                <div className="bg-red-900 text-red-200 p-4 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                    <p>{error}</p>
                    <button 
                        onClick={handleBackClick}
                        className="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!game) {
        return null;
    }

    // Format release date
    const releaseDate = game.released 
        ? new Date(game.released).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'TBA';

    // For mobile, truncate long descriptions - safely handle undefined description
    const gameDescription = game.description || game.description_raw || '';
    const descriptionIsTooLong = gameDescription.length > 500;
    const truncatedDescription = descriptionIsTooLong && !showFullDescription 
        ? `${gameDescription.substring(0, 450)}...` 
        : gameDescription;

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <button 
                    onClick={handleBackClick}
                    className="flex items-center text-gray-400 hover:text-white transition p-2 -ml-2"
                    aria-label="Go back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back
                </button>
            </div>

            {/* Show partial fetch errors as warnings */}
            {Object.keys(fetchErrors).length > 0 && (
                <div className="bg-yellow-900 text-yellow-200 p-3 rounded-lg shadow-lg mb-4 sm:mb-6 text-xs sm:text-sm">
                    <h3 className="font-semibold mb-1">Some content could not be loaded:</h3>
                    <ul className="list-disc list-inside">
                        {Object.values(fetchErrors).map((errorMsg, index) => (
                            <li key={index}>{errorMsg}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Main game information - stacked on mobile, side by side on larger screens */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                {/* Screenshot gallery - full width on mobile */}
                <div className="w-full lg:w-2/3">
                    <div className="relative rounded-lg overflow-hidden bg-gray-800 shadow-lg h-56 sm:h-64 md:h-80">
                        <img 
                            src={screenshots[activeImage]?.image || game.background_image || 'https://via.placeholder.com/1200x675?text=No+Image'} 
                            alt={`${game.name} screenshot`}
                            className="w-full h-full object-contain" 
                            onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.src = game.background_image || 'https://via.placeholder.com/1200x675?text=No+Image';
                                console.log('Screenshot image failed to load, using fallback');
                            }}
                        />
                        
                        {/* Navigation arrows for screenshots if there are multiple */}
                        {screenshots.length > 1 && (
                            <>
                                <button 
                                    onClick={() => setActiveImage((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1))}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition"
                                    aria-label="Previous screenshot"
                                    style={{ minHeight: '40px', minWidth: '40px' }} // Ensuring minimum touch target size
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => setActiveImage((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition"
                                    aria-label="Next screenshot"
                                    style={{ minHeight: '40px', minWidth: '40px' }} // Ensuring minimum touch target size
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail gallery - scrollable on all screens */}
                    {screenshots.length > 1 && (
                        <div className="flex overflow-x-auto gap-2 mt-2 pb-2 snap-x">
                            {screenshots.map((screenshot, index) => (
                                <img 
                                    key={screenshot.id}
                                    src={screenshot.image}
                                    alt={`${game.name} thumbnail ${index + 1}`}
                                    className={`h-16 sm:h-20 w-28 sm:w-36 object-cover rounded cursor-pointer transition snap-start ${activeImage === index ? 'ring-2 ring-purple-500' : 'opacity-70 hover:opacity-100'}`}
                                    onClick={() => setActiveImage(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Game info card - full width on mobile */}
                <div className="w-full lg:w-1/3 bg-gray-900 bg-opacity-80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-xl border border-fae border-opacity-20">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">{game.name}</h1>
                        <button
                            onClick={handleFavoriteToggle}
                            className={`p-2 rounded-full ${
                                isFavorite(game.id) ? 'bg-fae-dark text-white glow-fae' : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                            } transition`}
                            aria-label={isFavorite(game.id) ? "Remove from favorites" : "Add to favorites"}
                            style={{ minHeight: '40px', minWidth: '40px' }} // Ensuring minimum touch target size
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-6 w-6" 
                                fill={isFavorite(game.id) ? "currentColor" : "none"} 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                />
                            </svg>
                        </button>
                    </div>

                    {game.metacritic && (
                        <div className="mb-4">
                            <span className={`px-3 py-1 text-sm rounded font-bold ${
                                game.metacritic >= 75 ? 'bg-green-800 text-green-200' :
                                game.metacritic >= 50 ? 'bg-yellow-700 text-yellow-100' :
                                'bg-red-800 text-red-200'
                            }`}>
                                Metacritic: {game.metacritic}
                            </span>
                        </div>
                    )}

                    <div className="mb-4">
                        <h2 className="text-gray-400 text-sm mb-1">Released</h2>
                        <p className="text-white">{releaseDate}</p>
                    </div>

                    {game.genres && game.genres.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-gray-400 text-sm mb-1">Genres</h2>
                            <div className="flex flex-wrap gap-2">
                                {game.genres.map((genre) => (
                                    <span 
                                        key={genre.id} 
                                        className="px-2 py-1 bg-gray-700 rounded text-gray-300 text-sm"
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Collapsible platforms section for mobile */}
                    <details className="mb-4 lg:hidden">
                        <summary className="text-gray-400 text-sm mb-1 cursor-pointer focus:outline-none">
                            Platforms
                        </summary>
                        {game.platforms && game.platforms.length > 0 && (
                            <div className="mt-2">
                                <div className="flex flex-wrap gap-2">
                                    {game.platforms.map((platform) => (
                                        <span 
                                            key={platform.platform.id} 
                                            className="px-2 py-1 bg-gray-700 rounded text-gray-300 text-sm"
                                        >
                                            {platform.platform.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </details>

                    {/* Desktop view for platforms */}
                    {game.platforms && game.platforms.length > 0 && (
                        <div className="mb-4 hidden lg:block">
                            <h2 className="text-gray-400 text-sm mb-1">Platforms</h2>
                            <div className="flex flex-wrap gap-2">
                                {game.platforms.map((platform) => (
                                    <span 
                                        key={platform.platform.id} 
                                        className="px-2 py-1 bg-gray-700 rounded text-gray-300 text-sm"
                                    >
                                        {platform.platform.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Collapsible developers section for mobile */}
                    <details className="mb-4 lg:hidden">
                        <summary className="text-gray-400 text-sm mb-1 cursor-pointer focus:outline-none">
                            Developers & Publishers
                        </summary>
                        <div className="mt-2 space-y-3">
                            {game.developers && game.developers.length > 0 && (
                                <div>
                                    <h3 className="text-gray-400 text-xs">Developers</h3>
                                    <p className="text-white text-sm">{game.developers.map(dev => dev.name).join(', ')}</p>
                                </div>
                            )}
                            
                            {game.publishers && game.publishers.length > 0 && (
                                <div>
                                    <h3 className="text-gray-400 text-xs">Publishers</h3>
                                    <p className="text-white text-sm">{game.publishers.map(pub => pub.name).join(', ')}</p>
                                </div>
                            )}
                            
                            {game.esrb_rating && (
                                <div>
                                    <h3 className="text-gray-400 text-xs">Age Rating</h3>
                                    <p className="text-white text-sm">{game.esrb_rating.name}</p>
                                </div>
                            )}
                        </div>
                    </details>

                    {/* Desktop view for developers and publishers */}
                    <div className="hidden lg:block space-y-4">
                        {game.developers && game.developers.length > 0 && (
                            <div>
                                <h2 className="text-gray-400 text-sm mb-1">Developers</h2>
                                <p className="text-white">{game.developers.map(dev => dev.name).join(', ')}</p>
                            </div>
                        )}

                        {game.publishers && game.publishers.length > 0 && (
                            <div>
                                <h2 className="text-gray-400 text-sm mb-1">Publishers</h2>
                                <p className="text-white">{game.publishers.map(pub => pub.name).join(', ')}</p>
                            </div>
                        )}

                        {game.esrb_rating && (
                            <div>
                                <h2 className="text-gray-400 text-sm mb-1">Age Rating</h2>
                                <p className="text-white">{game.esrb_rating.name}</p>
                            </div>
                        )}
                    </div>

                    {game.website && (
                        <div className="mt-4">
                            <h2 className="text-gray-400 text-sm mb-1">Website</h2>
                            <a 
                                href={game.website} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-purple-400 hover:text-purple-300 transition text-sm break-words"
                            >
                                {game.website}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Game description with "Read more" for mobile */}
            {gameDescription && (
                <div className="mt-6 bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 sm:p-6 shadow-xl border border-fae border-opacity-20">
                    <h2 className="text-xl font-semibold text-white mb-3">About</h2>
                    <div 
                        className="text-gray-300 prose prose-invert max-w-none text-sm sm:text-base"
                        dangerouslySetInnerHTML={{ __html: truncatedDescription }}
                    />
                    
                    {descriptionIsTooLong && (
                        <button 
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="mt-2 text-purple-400 hover:text-purple-300 text-sm transition"
                        >
                            {showFullDescription ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </div>
            )}
            
            {/* Collections section */}
            <div className="mt-6">
                <Collections activeGame={game} />
            </div>

            {/* Developer games section - more compact on mobile */}
            {game.developers && game.developers.length > 0 && developerGames.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold text-white mb-3 sm:mb-4">
                        More Games by {game.developers[0].name}
                    </h2>
                    
                    {loadingDeveloperGames ? (
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                                    <div className="w-full h-36 bg-gray-700"></div>
                                    <div className="p-3 sm:p-4">
                                        <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <GameList 
                            games={developerGames} 
                            onGameSelect={handleSimilarGameSelect} 
                            loading={false} 
                        />
                    )}
                </div>
            )}

            {/* Similar games section - more compact on mobile */}
            {similarGames.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold text-white mb-3 sm:mb-4">Similar Games</h2>
                    <GameList 
                        games={similarGames} 
                        onGameSelect={handleSimilarGameSelect} 
                        loading={false} 
                    />
                </div>
            )}
        </div>
    );
};

export default GameDetails;