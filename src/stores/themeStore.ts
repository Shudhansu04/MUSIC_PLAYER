import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';

type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  theme: ThemeMode;
  colors: typeof colors.light;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  loadTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = 'app-theme';

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'dark',
  colors: colors.dark,

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  setTheme: async (theme: ThemeMode) => {
    const themeColors = theme === 'light' ? colors.light : colors.dark;
    set({ theme, colors: themeColors });
    
    // Save to storage
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },

  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        get().setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  },
}));
