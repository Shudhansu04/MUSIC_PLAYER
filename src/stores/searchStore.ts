import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

const STORAGE_KEY = 'search-storage';

interface SearchStore {
  recentSearches: string[];
  searchResults: Song[];
  isLoading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  query: string;
  
  // Actions
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setSearchResults: (results: Song[], total: number, page: number, query: string) => void;
  addSearchResults: (results: Song[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  loadFromStorage: () => void;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  recentSearches: [],
  searchResults: [],
  isLoading: false,
  error: null,
  totalResults: 0,
  currentPage: 1,
  query: '',

  addRecentSearch: async (query) => {
    if (!query.trim()) return;
    
    set((state) => {
      const filtered = state.recentSearches.filter((s) => s.toLowerCase() !== query.toLowerCase());
      const newSearches = [query, ...filtered].slice(0, 10);
      
      // Save asynchronously without blocking state update
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSearches)).catch((error) => {
        console.error('Failed to save recent searches:', error);
      });
      
      return { recentSearches: newSearches };
    });
  },

  clearRecentSearches: async () => {
    set({ recentSearches: [] });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  },

  setSearchResults: (results, total, page, query) => {
    set({
      searchResults: results,
      totalResults: total,
      currentPage: page,
      query,
      error: null,
    });
  },

  addSearchResults: (results) => {
    set((state) => ({
      searchResults: [...state.searchResults, ...results],
      currentPage: state.currentPage + 1,
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  reset: () => {
    set({
      searchResults: [],
      totalResults: 0,
      currentPage: 1,
      query: '',
      error: null,
    });
  },

  loadFromStorage: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const searches = JSON.parse(saved);
        set({ recentSearches: searches });
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  },
}));
