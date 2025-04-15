import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../context/CollectionsContext';
import { useAuth } from '../context/AuthContext';
import { Game } from '../services/api';

interface CollectionsProps {
    activeGame?: Game;
}

const Collections: React.FC<CollectionsProps> = ({ activeGame }) => {
    const { collections, isLoading, error, createNewCollection, deleteExistingCollection, addGame } = useCollections();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newCollectionDescription, setNewCollectionDescription] = useState('');
    const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleCreateCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;
        
        try {
        await createNewCollection(newCollectionName, newCollectionDescription);
        setNewCollectionName('');
        setNewCollectionDescription('');
        setIsCreateModalOpen(false);
        } catch (error) {
        console.error("Error creating collection:", error);
        }
    };

    const handleDeleteCollection = async (collectionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this collection?")) {
        try {
            await deleteExistingCollection(collectionId);
        } catch (error) {
            console.error("Error deleting collection:", error);
        }
        }
    };

    const handleAddGameToCollection = async (collectionId: string) => {
        if (!activeGame) return;
        
        try {
        await addGame(collectionId, activeGame);
        setIsAddToCollectionOpen(false);
        } catch (error) {
        console.error("Error adding game to collection:", error);
        }
    };

    const handleViewCollection = (collectionId: string) => {
        navigate(`/collection/${collectionId}`);
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    if (!currentUser) {
        return (
        <div className="card-fantasy rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="p-4 text-center">
            <p className="text-gray-300">Sign in to create and manage your game collections</p>
            </div>
        </div>
        );
    }

    return (
        <div className="card-fantasy rounded-lg shadow-lg overflow-hidden mb-6">
        <button
            onClick={toggleOpen}
            className="w-full flex justify-between items-center p-4 hover:bg-sage-medium transition"
        >
            <div className="flex items-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-fae mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
            </svg>
            <h2 className="text-lg font-semibold text-white">Your Collections</h2>
            <span className="ml-2 px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300 border border-fae border-opacity-10">
                {collections.length}
            </span>
            </div>
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-fae transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
            </svg>
        </button>

        {isOpen && (
            <div className="p-4">
            {isLoading ? (
                <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-fae border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-center py-2">
                {error}
                </div>
            ) : (
                <>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-fae font-medium">My Collections</h3>
                    <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-sm px-3 py-1 bg-fae-dark text-white rounded hover:bg-fae transition"
                    >
                    + New Collection
                    </button>
                </div>

                {collections.length === 0 ? (
                    <div className="text-center py-6">
                    <p className="text-gray-400">You don't have any collections yet.</p>
                    <p className="text-gray-500 text-sm mt-1">
                        Collections help you organize games you're interested in.
                    </p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {collections.map((collection) => (
                        <div 
                        key={collection.id}
                        className="bg-sage-medium rounded-md p-3 cursor-pointer hover:bg-gray-700 transition group"
                        onClick={() => handleViewCollection(collection.id)}
                        >
                        <div className="flex justify-between items-start">
                            <div>
                            <h4 className="font-medium text-white">{collection.name}</h4>
                            <p className="text-sm text-gray-400 truncate">{collection.description}</p>
                            <div className="flex items-center mt-1">
                                <span className="text-xs text-gray-500">{collection.games.length} games</span>
                                {activeGame && (
                                <button 
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddGameToCollection(collection.id);
                                    }}
                                    className="ml-2 text-xs px-2 py-0.5 bg-fae-dark text-white rounded hover:bg-fae transition opacity-0 group-hover:opacity-100"
                                >
                                    Add Current Game
                                </button>
                                )}
                            </div>
                            </div>
                            
                            <button 
                            onClick={(e) => handleDeleteCollection(collection.id, e)}
                            className="p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            </button>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                
                {activeGame && (
                    <div className="mt-4">
                    <button
                        onClick={() => setIsAddToCollectionOpen(true)}
                        className="w-full py-2 bg-fae-dark text-white rounded hover:bg-fae transition"
                    >
                        Add "{activeGame.name}" to a Collection
                    </button>
                    </div>
                )}
                </>
            )}
            </div>
        )}

        {/* Create Collection Modal */}
        {isCreateModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 border border-fae border-opacity-20">
                <h3 className="text-xl font-bold text-white mb-4">Create New Collection</h3>
                <form onSubmit={handleCreateCollection}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-300 mb-1">Name</label>
                    <input
                    type="text"
                    id="name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fae"
                    placeholder="e.g., Currently Playing"
                    required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="description" className="block text-gray-300 mb-1">Description (optional)</label>
                    <textarea
                    id="description"
                    value={newCollectionDescription}
                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fae"
                    placeholder="e.g., Games I'm currently playing through"
                    rows={3}
                    />
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                    >
                    Cancel
                    </button>
                    <button
                    type="submit"
                    className="px-4 py-2 bg-fae-dark text-white rounded hover:bg-fae transition"
                    >
                    Create Collection
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {/* Add to Collection Modal */}
        {isAddToCollectionOpen && activeGame && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 border border-fae border-opacity-20">
                <h3 className="text-xl font-bold text-white mb-4">Add to Collection</h3>
                <p className="text-gray-300 mb-4">Select a collection to add "{activeGame.name}" to:</p>
                
                {collections.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-gray-400">You don't have any collections yet.</p>
                    <button
                    onClick={() => {
                        setIsAddToCollectionOpen(false);
                        setIsCreateModalOpen(true);
                    }}
                    className="mt-2 text-sm px-3 py-1 bg-fae-dark text-white rounded hover:bg-fae transition"
                    >
                    Create a Collection
                    </button>
                </div>
                ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                    {collections.map((collection) => {
                    const gameAlreadyInCollection = collection.games.some(game => game.id === activeGame.id);
                    
                    return (
                        <button
                        key={collection.id}
                        onClick={() => handleAddGameToCollection(collection.id)}
                        disabled={gameAlreadyInCollection}
                        className={`w-full text-left bg-sage-medium rounded-md p-3 transition ${
                            gameAlreadyInCollection 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-gray-700 cursor-pointer'
                        }`}
                        >
                        <div className="flex justify-between items-center">
                            <div>
                            <h4 className="font-medium text-white">{collection.name}</h4>
                            <p className="text-sm text-gray-400 truncate">{collection.description}</p>
                            </div>
                            {gameAlreadyInCollection && (
                            <span className="text-xs px-2 py-0.5 bg-fae-dark text-white rounded">
                                Already Added
                            </span>
                            )}
                        </div>
                        </button>
                    );
                    })}
                </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-4">
                <button
                    onClick={() => setIsAddToCollectionOpen(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                >
                    Cancel
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
};

export default Collections;