import { useFavorites } from '../context/FavoritesContext';

const GameCard = ({ game, onClick }) => {
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const isGameFavorite = isFavorite(game.id);

    const handleFavoriteClick = (e) => {
        e.stopPropagation(); // Prevent triggering the card click event
        if (isGameFavorite) {
        removeFavorite(game.id);
        } else {
        addFavorite(game);
        }
    };

    // Format release date to just show the year
    const releaseYear = game.released ? new Date(game.released).getFullYear() : 'TBA';

    return (
        <div 
        className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer"
        onClick={() => onClick(game.id)}
        >
        <div className="relative">
            <img 
            src={game.background_image || 'https://via.placeholder.com/300x150?text=No+Image'} 
            alt={game.name} 
            className="w-full h-48 object-cover"
            />
            <button
            onClick={handleFavoriteClick}
            className={`absolute top-2 right-2 p-2 rounded-full ${
                isGameFavorite ? 'bg-red-500' : 'bg-gray-700 bg-opacity-70 hover:bg-gray-600'
            }`}
            >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill={isGameFavorite ? "currentColor" : "none"} 
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
        <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-1 truncate">{game.name}</h3>
            <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{releaseYear}</span>
            {game.metacritic && (
                <span className={`px-2 py-1 text-xs rounded font-bold ${
                game.metacritic >= 75 ? 'bg-green-800 text-green-200' :
                game.metacritic >= 50 ? 'bg-yellow-700 text-yellow-100' :
                'bg-red-800 text-red-200'
                }`}>
                {game.metacritic}
                </span>
            )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
            {game.genres?.slice(0, 2).map((genre) => (
                <span 
                key={genre.id} 
                className="px-2 py-1 bg-gray-700 rounded text-gray-300 text-xs"
                >
                {genre.name}
                </span>
            ))}
            </div>
        </div>
        </div>
    );
};

export default GameCard;