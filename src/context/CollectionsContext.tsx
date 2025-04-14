import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  GameCollection, 
  getUserCollections, 
  createCollection, 
  updateCollection, 
  deleteCollection,
  addGameToCollection,
  removeGameFromCollection
} from '../services/firebase';
import { useAuth } from './AuthContext';
import { Game } from '../services/api';

interface CollectionsContextType {
  collections: GameCollection[];
  isLoading: boolean;
  error: string | null;
  createNewCollection: (name: string, description: string) => Promise<string>;
  updateExistingCollection: (collectionId: string, data: Partial<GameCollection>) => Promise<void>;
  deleteExistingCollection: (collectionId: string) => Promise<void>;
  addGame: (collectionId: string, game: Game) => Promise<void>;
  removeGame: (collectionId: string, gameId: number) => Promise<void>;
  refreshCollections: () => Promise<void>;
}

interface CollectionsProviderProps {
  children: ReactNode;
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

export const CollectionsProvider: React.FC<CollectionsProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [collections, setCollections] = useState<GameCollection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's collections when user changes
  useEffect(() => {
    const fetchCollections = async () => {
      if (currentUser) {
        await refreshCollections();
      } else {
        // Clear collections when user logs out
        setCollections([]);
      }
    };

    fetchCollections();
  }, [currentUser]);

  const refreshCollections = async (): Promise<void> => {
    if (!currentUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userCollections = await getUserCollections(currentUser.uid);
      setCollections(userCollections);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('Failed to load your collections');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewCollection = async (name: string, description: string): Promise<string> => {
    if (!currentUser) {
      throw new Error('You must be logged in to create collections');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const collectionId = await createCollection({
        name,
        description,
        games: [],
        userId: currentUser.uid
      });
      
      await refreshCollections();
      return collectionId;
    } catch (err) {
      console.error('Error creating collection:', err);
      setError('Failed to create collection');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExistingCollection = async (collectionId: string, data: Partial<GameCollection>): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to update collections');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await updateCollection(collectionId, data);
      await refreshCollections();
    } catch (err) {
      console.error('Error updating collection:', err);
      setError('Failed to update collection');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExistingCollection = async (collectionId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to delete collections');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteCollection(collectionId);
      setCollections(collections.filter(c => c.id !== collectionId));
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError('Failed to delete collection');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addGame = async (collectionId: string, game: Game): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to add games to collections');
    }
    
    setError(null);
    
    try {
      await addGameToCollection(collectionId, game);
      await refreshCollections();
    } catch (err) {
      console.error('Error adding game to collection:', err);
      setError('Failed to add game to collection');
      throw err;
    }
  };

  const removeGame = async (collectionId: string, gameId: number): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to remove games from collections');
    }
    
    setError(null);
    
    try {
      await removeGameFromCollection(collectionId, gameId);
      await refreshCollections();
    } catch (err) {
      console.error('Error removing game from collection:', err);
      setError('Failed to remove game from collection');
      throw err;
    }
  };

  const value = {
    collections,
    isLoading,
    error,
    createNewCollection,
    updateExistingCollection,
    deleteExistingCollection,
    addGame,
    removeGame,
    refreshCollections
  };

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
};

export const useCollections = (): CollectionsContextType => {
  const context = useContext(CollectionsContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }
  return context;
};

export default CollectionsContext;