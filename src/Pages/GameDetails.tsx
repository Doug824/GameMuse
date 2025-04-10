import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGameDetails, getGameScreenshots, getSimilarGames, Game, Screenshot } from '../services/api';
import { useFavorites } from '../context/FavoritesContext';
import GameList from '../components/GameList';

interface GameDetailsParams {
    id: string;
}

const GameDetails: React.FC = () => {
    const { id } = useParams<keyof GameDetailsParams>() as GameDetailsParams;
    const navigate = useNavigate();
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    
    const [game, setGame] = useState<Game | null>(null);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [similarGames, setSimilarGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeImage, setActiveImage] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [fetchErrors, setFetchErrors] = useState<{[key: string]: string}>({});

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                setLoading(true);
                setError(null);
                setFetchErrors({});
                
                // Check if API key exists
                const apiKey = import.meta.env.VITE_RAWG_API_KEY;
                if (!apiKey) {
                    setError('API key is missing. Please configure your .env file with a valid RAWG API key.');
                    setLoading(false);
                    return;
                }
                
                console.log(`Fetching details for game ID: ${id}`);
                
                // Fetch each data piece separately to better identify which request fails
                let gameData: Game | null = null;
                let screenshotsData: Screenshot[] = [];
                let similarGamesData: Game[] = [];
                
                const errors: {[key: string]: string} = {};
                
                try {
                    gameData = await getGameDetails(id);
                    console.log('Game details fetched successfully');
                } catch (error) {
                    console.error('Error fetching game details:', error);
                    errors.details = 'Could not load game details';
                }
                
                try {
                    const screenshotsResponse = await getGameScreenshots(id);
                    screenshotsData = screenshotsResponse.results || [];
                    console.log(`Fetched ${screenshotsData.length} screenshots`);
                } catch (error) {
                    console.error('Error fetching screenshots:', error);
                    errors.screenshots = 'Could not load screenshots';
                }
                
                try {
                    const similarGamesResponse = await getSimilarGames(id);
                    similarGamesData = similarGamesResponse.results || [];
                    console.log(`Fetched ${similarGamesData.length} similar games`);
                } catch (error) {
                    console.error('Error fetching similar games:', error);
                    errors.similar = 'Could not load similar games';
                }
                
                // Update state with whatever data we successfully fetched
                if (gameData) {
                    setGame(gameData);
                    setScreenshots(screenshotsData);
                    setSimilarGames(similarGamesData);
                    
                    // Store any partial errors
                    if (Object.keys(errors).length > 0) {
                        setFetchErrors(errors);
                    }
                } else {
                    // If we couldn't fetch the main game data, that's a critical error
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
        navigate(`/game/${gameId}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 animate-pulse">
                <div className="h-8 w-64 bg-gray-700 rounded mb-4"></div>
                <div className="h-96 w-full bg-gray-700 rounded mb-8"></div>
                <div className="h-6 w-full bg-gray-700 rounded mb-2"></div>
                <div className="h-6 w-full bg-gray-700 rounded mb-2"></div>
                <div className="h-6 w-3/4 bg-gray-700 rounded"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <div className="bg-red-900 text-red-200 p-4 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                    <p>{error}</p>
                    <button 
                        onClick={() => navigate('/')}
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-400 hover:text-white mb-6 transition"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
            </button>
                
                <Link to="/" className="flex items-center text-xl font-bold transition hover:opacity-80">
                    <span className="text-purple-500">Game</span>
                    <span className="text-white">Muse</span>
                </Link>
                </div>

            {/* Show partial fetch errors as warnings */}
            {Object.keys(fetchErrors).length > 0 && (
                <div className="bg-yellow-900 text-yellow-200 p-3 rounded-lg shadow-lg mb-6 text-sm">
                    <h3 className="font-semibold mb-1">Some content could not be loaded:</h3>
                    <ul className="list-disc list-inside">
                        {Object.values(fetchErrors).map((errorMsg, index) => (
                            <li key={index}>{errorMsg}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left column with image gallery */}
                <div className="w-full lg:w-2/3">
                    <div className="relative rounded-lg overflow-hidden bg-gray-800 shadow-lg h-96">
                        <img 
                            src={screenshots[activeImage]?.image || game.background_image || 'https://via.placeholder.com/1200x675?text=No+Image'} 
                            alt={`${game.name} screenshot`}
                            className="w-full h-full object-contain" // Changed from object-cover to object-contain
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
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => setActiveImage((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition"
                                    aria-label="Next screenshot"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail gallery */}
                    {screenshots.length > 1 && (
                        <div className="flex overflow-x-auto gap-2 mt-2 pb-2">
                            {screenshots.map((screenshot, index) => (
                                <img 
                                    key={screenshot.id}
                                    src={screenshot.image}
                                    alt={`${game.name} thumbnail ${index + 1}`}
                                    className={`h-20 w-36 object-cover rounded cursor-pointer transition ${activeImage === index ? 'ring-2 ring-purple-500' : 'opacity-70 hover:opacity-100'}`}
                                    onClick={() => setActiveImage(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right column with game info */}
                <div className="w-full lg:w-1/3 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-3xl font-bold text-white">{game.name}</h1>
                        <button
                            onClick={handleFavoriteToggle}
                            className={`p-2 rounded-full ${
                                isFavorite(game.id) ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
                            } transition`}
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

                    {game.platforms && game.platforms.length > 0 && (
                        <div className="mb-4">
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

                    {game.developers && game.developers.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-gray-400 text-sm mb-1">Developers</h2>
                            <p className="text-white">{game.developers.map(dev => dev.name).join(', ')}</p>
                        </div>
                    )}

                    {game.publishers && game.publishers.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-gray-400 text-sm mb-1">Publishers</h2>
                            <p className="text-white">{game.publishers.map(pub => pub.name).join(', ')}</p>
                        </div>
                    )}

                    {game.esrb_rating && (
                        <div className="mb-4">
                            <h2 className="text-gray-400 text-sm mb-1">Age Rating</h2>
                            <p className="text-white">{game.esrb_rating.name}</p>
                        </div>
                    )}

                    {game.website && (
                        <div className="mb-4">
                            <h2 className="text-gray-400 text-sm mb-1">Website</h2>
                            <a 
                                href={game.website} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-purple-400 hover:text-purple-300 transition"
                            >
                                {game.website}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Game description */}
            {game.description && (
                <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                    <div 
                        className="text-gray-300 prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: game.description }}
                    />
                </div>
            )}

            {/* Similar games section */}
            {similarGames.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Similar Games</h2>
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