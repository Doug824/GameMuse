import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../context/CollectionsContext';
import { useAuth } from '../context/AuthContext';

interface CollectionsButtonProps {
    className?: string;
    }

    const CollectionsButton: React.FC<CollectionsButtonProps> = ({ className = '' }) => {
    const { collections, isLoading } = useCollections();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    const handleViewCollection = (collectionId: string) => {
        navigate(`/collection/${collectionId}`);
        setIsOpen(false);
    };

    const handleCreateNew = () => {
        // Open the Collections component's create modal by navigating to a specific route
        // or using a context method. For now, just navigate to home where the Collections component is
        navigate('/');
        setIsOpen(false);
    };

    if (!currentUser) {
        return (
        <div className={`bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden mb-6 ${className}`}>
            <button
            onClick={() => navigate('/')}
            className="w-full flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-700 transition"
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
            </div>
            </button>
            <div className="p-4 text-center">
            <p className="text-gray-300">Sign in to create and manage your game collections</p>
            </div>
        </div>
        );
    }

    return (
        <div className={`bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden mb-6 ${className}`}>
        <button
            onClick={toggleOpen}
            className="w-full flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-700 transition"
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
            <span className="ml-2 px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                {collections.length}
            </span>
            </div>
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
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
            ) : collections.length === 0 ? (
                <div className="text-center py-6">
                <p className="text-gray-400">You don't have any collections yet.</p>
                <button
                    onClick={handleCreateNew}
                    className="mt-4 px-4 py-2 bg-fae-dark text-white rounded hover:bg-fae transition"
                >
                    Create Your First Collection
                </button>
                </div>
            ) : (
                <>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {collections.map((collection) => (
                    <div
                        key={collection.id}
                        className="bg-gray-700 rounded-md p-3 cursor-pointer hover:bg-gray-600 transition"
                        onClick={() => handleViewCollection(collection.id)}
                    >
                        <h4 className="font-medium text-white">{collection.name}</h4>
                        {collection.description && (
                        <p className="text-sm text-gray-300 truncate">{collection.description}</p>
                        )}
                        <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-400">{collection.games.length} games</span>
                        </div>
                    </div>
                    ))}
                </div>

                <button
                    onClick={handleCreateNew}
                    className="mt-4 w-full py-2 bg-fae-dark text-white rounded hover:bg-fae transition flex items-center justify-center"
                >
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                    />
                    </svg>
                    Create New Collection
                </button>
                </>
            )}
            </div>
        )}
        </div>
    );
};

export default CollectionsButton;