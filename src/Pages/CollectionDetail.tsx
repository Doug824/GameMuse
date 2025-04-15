import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollections } from '../context/CollectionsContext';
import { useAuth } from '../context/AuthContext';
import GameList from '../components/GameList';
import { GameCollection } from '../services/firebase';

const CollectionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { collections, isLoading, error, removeGame, updateExistingCollection } = useCollections();
    const { currentUser } = useAuth();
    
    const [collection, setCollection] = useState<GameCollection | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        if (collections.length > 0 && id) {
        const foundCollection = collections.find(c => c.id === id);
        if (foundCollection) {
            setCollection(foundCollection);
            setEditName(foundCollection.name);
            setEditDescription(foundCollection.description || '');
        } else {
            // Collection not found, redirect back to home
            navigate('/');
        }
        }
    }, [collections, id, navigate]);

    // Authorization check - redirect if not logged in or not the owner
    useEffect(() => {
        if (!isLoading && currentUser && collection) {
        if (collection.userId !== currentUser.uid) {
            navigate('/');
        }
        }
        if (!isLoading && !currentUser) {
        navigate('/');
        }
    }, [collection, currentUser, isLoading, navigate]);

    const handleGameRemove = async (gameId: number) => {
        if (!id) return;
        
        try {
        await removeGame(id, gameId);
        } catch (error) {
        console.error('Error removing game:', error);
        }
    };

    const handleGameSelect = (gameId: number) => {
        navigate(`/game/${gameId}`);
    };

    const handleSaveEdit = async () => {
        if (!id || !editName.trim()) return;
        
        try {
        await updateExistingCollection(id, {
            name: editName,
            description: editDescription
        });
        setIsEditing(false);
        } catch (error) {
        console.error('Error updating collection:', error);
        }
    };

    if (isLoading) {
        return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-fae border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-red-900 bg-opacity-80 text-white p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            <button 
                onClick={() => navigate('/')}
                className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded"
            >
                Back to Home
            </button>
            </div>
        </div>
        );
    }

    if (!collection) {
        return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Collection Not Found</h2>
            <p>The collection you're looking for doesn't exist or you don't have access to it.</p>
            <button 
                onClick={() => navigate('/')}
                className="mt-4 px-4 py-2 bg-fae-dark hover:bg-fae rounded text-white"
            >
                Back to Home
            </button>
            </div>
        </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
        <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white mb-6 transition"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
        </button>

        <div className="card-fantasy p-6 rounded-lg mb-6">
            {isEditing ? (
            <div>
                <div className="mb-4">
                <label htmlFor="edit-name" className="block text-gray-300 mb-1">Collection Name</label>
                <input
                    type="text"
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fae"
                    required
                />
                </div>
                <div className="mb-4">
                <label htmlFor="edit-description" className="block text-gray-300 mb-1">Description</label>
                <textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fae"
                    rows={3}
                />
                </div>
                <div className="flex space-x-3">
                <button 
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-fae-dark text-white rounded hover:bg-fae transition"
                >
                    Save Changes
                </button>
                <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                >
                    Cancel
                </button>
                </div>
            </div>
            ) : (
            <div>
                <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">{collection.name}</h1>
                    {collection.description && (
                    <p className="text-gray-400 mt-1">{collection.description}</p>
                    )}
                </div>
                <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-400 hover:text-white transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                </div>
                
                <div className="flex items-center text-gray-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">
                    Last updated {new Date(collection.updatedAt).toLocaleDateString()}
                </span>
                </div>
                
                <div className="text-sm text-gray-400">
                {collection.games.length} {collection.games.length === 1 ? 'game' : 'games'} in this collection
                </div>
            </div>
            )}
        </div>

        {collection.games.length === 0 ? (
            <div className="text-center py-12 card-fantasy rounded-lg">
            <h3 className="text-xl font-semibold text-fae">No games in this collection yet</h3>
            <p className="text-gray-400 mt-2">Browse games and add them to this collection</p>
            <button 
                onClick={() => navigate('/')}
                className="mt-4 px-4 py-2 bg-fae-dark text-white rounded hover:bg-fae transition"
            >
                Browse Games
            </button>
            </div>
        ) : (
            <div>
            <h2 className="text-xl font-semibold text-white mb-4">Games in this Collection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {collection.games.map(game => (
                <div key={game.id} className="relative group">
                    <div 
                    className="card-fantasy-highlight rounded-lg overflow-hidden shadow-xl transition-transform hover:scale-105 cursor-pointer"
                    onClick={() => handleGameSelect(game.id)}
                    >
                    <div className="relative">
                        <img 
                        src={game.background_image || 'https://via.placeholder.com/300x150?text=No+Image'} 
                        alt={game.name} 
                        className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                    </div>
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-1 truncate">{game.name}</h3>
                        <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">
                            {game.released ? new Date(game.released).getFullYear() : 'TBA'}
                        </span>
                        {game.metacritic && (
                            <span className={`px-2 py-1 text-xs rounded font-bold ${
                            game.metacritic >= 75 ? 'bg-green-800 text-green-200' :
                            game.metacritic >= 50 ? 'bg-autumn-gold text-white' :
                            'bg-red-800 text-red-200'
                            }`}>
                            {game.metacritic}
                            </span>
                        )}
                        </div>
                    </div>
                    </div>
                    
                    <button
                    onClick={() => handleGameRemove(game.id)}
                    className="absolute top-2 right-2 p-2 bg-red-900 bg-opacity-80 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    aria-label="Remove from collection"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                ))}
            </div>
            </div>
        )}
        </div>
    );
};

export default CollectionDetail;