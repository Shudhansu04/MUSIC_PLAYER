import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song, RepeatMode, PlayerState } from '../types';

const STORAGE_KEY = 'player-storage';

interface PlayerStore extends PlayerState {
  // Actions
  setCurrentSong: (song: Song | null) => void;
  togglePlayPause: () => void;
  setPlaying: (playing: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  toggleShuffle: () => void;
  setRepeat: (mode: RepeatMode) => void;
  setQueue: (songs: Song[], startIndex?: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  nextSong: () => void;
  previousSong: () => void;
  seek: (position: number) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  setError?: (error: string) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  shuffle: false,
  repeat: 'none',
  queue: [],
  currentIndex: -1,
  isLoading: false,

  setCurrentSong: (song) => {
    set({ currentSong: song, position: 0 });
    get().saveToStorage();
  },

  togglePlayPause: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
    get().saveToStorage();
  },

  setPlaying: (playing) => {
    set({ isPlaying: playing });
    get().saveToStorage();
  },

  setPosition: (position) => {
    set({ position });
  },

  setDuration: (duration) => {
    set({ duration });
  },

  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
    get().saveToStorage();
  },

  setRepeat: (mode) => {
    set({ repeat: mode });
    get().saveToStorage();
  },

  setQueue: (songs, startIndex = 0) => {
    const newSong = songs[startIndex] || null;
    set({ 
      queue: songs, 
      currentIndex: startIndex, 
      currentSong: newSong,
      isPlaying: newSong ? true : false, // Auto-play when queue is set
      position: 0, // Reset position for new song
    });
    get().saveToStorage(); // Async, doesn't block
  },

  addToQueue: (song) => {
    set((state) => {
      const newQueue = [...state.queue, song];
      return { queue: newQueue };
    });
    get().saveToStorage(); // Async, doesn't block
  },

  removeFromQueue: (index) => {
    set((state) => {
      const newQueue = state.queue.filter((_, i) => i !== index);
      let newIndex = state.currentIndex;
      
      if (index < state.currentIndex) {
        newIndex = state.currentIndex - 1;
      } else if (index === state.currentIndex) {
        newIndex = Math.min(newIndex, newQueue.length - 1);
        const newCurrentSong = newQueue[newIndex] || null;
        return { queue: newQueue, currentIndex: newIndex, currentSong: newCurrentSong };
      }
      
      return { queue: newQueue, currentIndex: newIndex };
    });
    get().saveToStorage();
  },

  reorderQueue: (fromIndex, toIndex) => {
    set((state) => {
      const newQueue = [...state.queue];
      const [removed] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, removed);
      
      let newIndex = state.currentIndex;
      if (fromIndex === state.currentIndex) {
        newIndex = toIndex;
      } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
        newIndex = state.currentIndex - 1;
      } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
        newIndex = state.currentIndex + 1;
      }
      
      return { queue: newQueue, currentIndex: newIndex };
    });
    get().saveToStorage();
  },

  nextSong: () => {
    set((state) => {
      if (state.queue.length === 0) return state;
      
      let nextIndex: number;
      if (state.shuffle) {
        nextIndex = Math.floor(Math.random() * state.queue.length);
      } else {
        nextIndex = state.currentIndex + 1;
        if (nextIndex >= state.queue.length) {
          if (state.repeat === 'all') {
            nextIndex = 0;
          } else {
            return { isPlaying: false };
          }
        }
      }
      
      return {
        currentIndex: nextIndex,
        currentSong: state.queue[nextIndex],
        position: 0,
      };
    });
    get().saveToStorage();
  },

  previousSong: () => {
    set((state) => {
      if (state.queue.length === 0) return state;
      
      let prevIndex: number;
      if (state.shuffle) {
        prevIndex = Math.floor(Math.random() * state.queue.length);
      } else {
        prevIndex = state.currentIndex - 1;
        if (prevIndex < 0) {
          if (state.repeat === 'all') {
            prevIndex = state.queue.length - 1;
          } else {
            return { isPlaying: false };
          }
        }
      }
      
      return {
        currentIndex: prevIndex,
        currentSong: state.queue[prevIndex],
        position: 0,
      };
    });
    get().saveToStorage();
  },

  seek: (position) => {
    set({ position });
  },

  loadFromStorage: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        set({
          queue: state.queue || [],
          currentIndex: state.currentIndex ?? -1,
          shuffle: state.shuffle || false,
          repeat: state.repeat || 'none',
          currentSong: state.queue?.[state.currentIndex] || null,
        });
      }
    } catch (error) {
      console.error('Failed to load player state:', error);
    }
  },

  saveToStorage: async () => {
    try {
      const state = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        queue: state.queue,
        currentIndex: state.currentIndex,
        shuffle: state.shuffle,
        repeat: state.repeat,
      }));
    } catch (error) {
      console.error('Failed to save player state:', error);
    }
  },
}));
