import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

interface FavoritesStore {
  favorites: Song[];
  addToFavorites: (song: Song) => void;
  removeFromFavorites: (songId: string) => void;
  isFavorite: (songId: string) => boolean;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'favorites-storage';

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: [],

  addToFavorites: (song: Song) => {
    set((state) => {
      const exists = state.favorites.some((s) => s.id === song.id);
      if (!exists) {
        const newFavorites = [...state.favorites, song];
        get().saveToStorage();
        return { favorites: newFavorites };
      }
      return state;
    });
  },

  removeFromFavorites: (songId: string) => {
    set((state) => {
      const newFavorites = state.favorites.filter((s) => s.id !== songId);
      get().saveToStorage();
      return { favorites: newFavorites };
    });
  },

  isFavorite: (songId: string) => {
    return get().favorites.some((s) => s.id === songId);
  },

  loadFromStorage: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const favorites = JSON.parse(saved);
        set({ favorites: favorites || [] });
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  },

  saveToStorage: async () => {
    try {
      const state = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  },
}));
