import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

interface PlaylistStore {
  playlists: Playlist[];
  addPlaylist: (name: string) => string;
  removePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  getPlaylist: (id: string) => Playlist | undefined;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'playlists-storage';

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],

  addPlaylist: (name: string) => {
    const id = `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPlaylist: Playlist = {
      id,
      name,
      songs: [],
      createdAt: Date.now(),
    };
    set((state) => ({
      playlists: [...state.playlists, newPlaylist],
    }));
    get().saveToStorage();
    return id;
  },

  removePlaylist: (id: string) => {
    set((state) => ({
      playlists: state.playlists.filter((p) => p.id !== id),
    }));
    get().saveToStorage();
  },

  addSongToPlaylist: (playlistId: string, song: Song) => {
    set((state) => ({
      playlists: state.playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          // Check if song already exists
          const exists = playlist.songs.some((s) => s.id === song.id);
          if (!exists) {
            return { ...playlist, songs: [...playlist.songs, song] };
          }
        }
        return playlist;
      }),
    }));
    get().saveToStorage();
  },

  removeSongFromPlaylist: (playlistId: string, songId: string) => {
    set((state) => ({
      playlists: state.playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            songs: playlist.songs.filter((s) => s.id !== songId),
          };
        }
        return playlist;
      }),
    }));
    get().saveToStorage();
  },

  getPlaylist: (id: string) => {
    return get().playlists.find((p) => p.id === id);
  },

  loadFromStorage: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const playlists = JSON.parse(saved);
        set({ playlists: playlists || [] });
      }
    } catch (error) {
      console.error('Failed to load playlists:', error);
    }
  },

  saveToStorage: async () => {
    try {
      const state = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.playlists));
    } catch (error) {
      console.error('Failed to save playlists:', error);
    }
  },
}));
