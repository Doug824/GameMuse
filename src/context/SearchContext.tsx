import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Game, FilterOptions } from '../services/api';

interface SearchContextType {
  games: Game[];
  searchQuery: string;
  filters: FilterOptions;
  loading: boolean;
  error: string | null;
  setGames: (games: Game[]) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: FilterOptions) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSearch: () => void;
}

interface SearchProviderProps {
  children: ReactNode;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearSearch = () => {
    setGames([]);
    setSearchQuery('');
    setFilters({});
    setLoading(false);
    setError(null);
  };

  const value = {
    games,
    searchQuery,
    filters,
    loading,
    error,
    setGames,
    setSearchQuery,
    setFilters,
    setLoading,
    setError,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export default SearchContext;