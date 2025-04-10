import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGameDetails, getGameScreenshots, getSimilarGames, getGamesByDeveloper, Game, Screenshot } from '../services/api';
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
    const [developerGames, setDeveloperGames] = useState<Game[]>([]);
    const [loadingDeveloperGames, setLoadingDeveloperGames] = useState<boolean>(false);

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
            // Scroll to top when navigating to a new game
            window.scrollTo(0, 0);
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
                <div className="h-8 w-64 bg-fog/50 rounded mb-4"></div>
                <div className="h-96 w-full bg-fog/40 rounded mb-8"></div>
                <div className="h-6 w-full bg-fog/30 rounded mb-2"></div>
                <div className="h-6 w-full bg-fog/30 rounded mb-2"></div>
                <div className="h-6 w-3/4 bg-fog/30 rounded"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <div className="bg-red-900/80 backdrop-blur-sm text-red-200 p-6 rounded-lg shadow-lg border border-red-700/50">
                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                    <p>{error}</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="mt-4 bg-red-700/80 hover:bg-red-600/80 text-white px-4 py-2 rounded transition-colors duration-300 shadow-md"
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
                    className="flex items-center text-tan hover:text-gold transition-colors duration-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back
                </button>
                
                <Link to="/" className="flex items-center text-xl font-bold transition hover:opacity-80">
                    <span className="text-gold">Game</span>
                    <span className="text-moonlight">Muse</span>
                </Link>
            </div>

            {/* Show partial fetch errors as warnings */}
            {Object.keys(fetchErrors).length > 0 && (
                <div className="bg-yellow-900/60 backdrop-blur-sm text-yellow-200 p-3 rounded-lg shadow-lg mb-6 text-sm border border-yellow-700/50">
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
                    <div className="relative rounded-lg overflow-hidden bg-fog/30 shadow-lg h-96 backdrop-blur-sm border border-forest/50 magical-border">
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
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-twilight/70 backdrop-blur-sm rounded-full p-2 text-tan hover:text-gold hover:bg-twilight/90 transition-all duration-300"
                                    aria-label="Previous screenshot"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => setActiveImage((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-twilight/70 backdrop-blur-sm rounded-full p-2 text-tan hover:text-gold hover:bg-twilight/90 transition-all duration-300"
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
                                    className={`h-20 w-36 object-cover rounded cursor-pointer transition-all duration-300 border-2 ${activeImage === index ? 'border-gold shadow-md shadow-gold/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    onClick={() => setActiveImage(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right column with game info */}
                <div className="w-full lg:w-1/3 bg-fog/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-forest/50">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-3xl font-bold text-mist glow-text">{game.name}</h1>
                        <button
                            onClick={handleFavoriteToggle}
                            className={`p-2 rounded-full transition-all duration-300 ${
                                isFavorite(game.id) 
                                ? 'bg-red-500/80 text-white shadow-md shadow-red-500/20' 
                                : 'bg-fog/70 text-tan hover:text-gold hover:bg-fog/90'
                            }`}
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
                                game.metacritic >= 75 ? 'bg-emerald-900/70 text-emerald-200' :
                                game.metacritic >= 50 ? 'bg-gold/70 text-twilight' :
                                'bg-red-800/70 text-red-200'
                            }`}>
                                Metacritic: {game.metacritic}
                            </span>
                        </div>
                    )}

                    <div className="mb-4">
                        <h2 className="text-tan text-sm mb-1">Released</h2>
                        <p className="text-mist">{releaseDate}</p>
                    </div>

                    {game.genres && game.genres.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-tan text-sm mb-1">Genres</h2>
                            <div className="flex flex-wrap gap-2">
                                {game.genres.map((genre) => (
                                    <span 
                                        key={genre.id} 
                                        className="px-2 py-1 bg-sage/30 border border-sage/40 rounded text-tan text-sm"
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {game.platforms && game.platforms.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-tan text-sm mb-1">Platforms</h2>
                            <div className="flex flex-wrap gap-2">
                                {game.platforms.map((platform) => (
                                    <span 
                                        key={platform.platform.id} 
                                        className="px-2 py-1 bg-fog/50 border border-forest/70 rounded text-tan text-sm"
                                    >
                                        {platform.platform.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {game.developers && game.developers.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-tan text-sm mb-1">Developers</h2>
                            <p className="text-mist">{game.developers.map(dev => dev.name).join(', ')}</p>
                        </div>
                    )}

                    {game.publishers && game.publishers.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-tan text-sm mb-1">Publishers</h2>
                            <p className="text-mist">{game.publishers.map(pub => pub.name).join(', ')}</p>
                        </div>
                    )}

                    {game.esrb_rating && (
                        <div className="mb-4">
                            <h2 className="text-tan text-sm mb-1">Age Rating</h2>
                            <p className="text-mist">{game.esrb_rating.name}</p>
                        </div>
                    )}

                    {game.website && (
                        <div className="mb-4">
                            <h2 className="text-tan text-sm mb-1">Website</h2>
                            <a 
                                href={game.website} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gold hover:text-ethereal transition-colors duration-300"
                            >
                                {game.website}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Game description */}
            {game.description && (
                <div className="mt-8 bg-fog/30 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-forest/50">
                    <h2 className="text-xl font-semibold text-mist mb-4 glow-text">About</h2>
                    <div 
                        className="text-tan prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: game.description }}
                    />
                </div>
            )}

            {/* Developer games section */}
            {game.developers && game.developers.length > 0 && developerGames.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-mist mb-4 glow-text">
                        More Games by {game.developers[0].name}
                    </h2>
                    
                    {loadingDeveloperGames ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="bg-fog/30 rounded-lg overflow-hidden shadow-lg">
                                    <div className="w-full h-48 bg-fog/20"></div>
                                    <div className="p-4">
                                        <div className="h-6 bg-fog/40 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-fog/40 rounded w-1/2"></div>
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

            {/* Similar games section */}
            {similarGames.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-mist mb-4 glow-text">Similar Games</h2>
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