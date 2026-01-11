import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { usePlayerStore } from './src/stores/playerStore';
import { useSearchStore } from './src/stores/searchStore';
import { useThemeStore } from './src/stores/themeStore';
import { usePlaylistStore } from './src/stores/playlistStore';
import { useFavoritesStore } from './src/stores/favoritesStore';
import { audioPlayer } from './src/services/audioPlayer';
import { Song } from './src/types';

export default function App() {
  const loadFromStorage = usePlayerStore((state) => state.loadFromStorage);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setPlaying = usePlayerStore((state) => state.setPlaying);
  const nextSong = usePlayerStore((state) => state.nextSong);
  const loadSearchFromStorage = useSearchStore((state) => state.loadFromStorage);
  const loadPlaylists = usePlaylistStore((state) => state.loadFromStorage);
  const loadFavorites = useFavoritesStore((state) => state.loadFromStorage);
  const theme = useThemeStore((state) => state.theme);
  const loadTheme = useThemeStore((state) => state.loadTheme);

  useEffect(() => {
    // Load persisted state (async)
    (async () => {
      await loadTheme();
      await loadFromStorage();
      await loadSearchFromStorage();
      await loadPlaylists();
      await loadFavorites();
    })();
  }, [loadTheme, loadFromStorage, loadSearchFromStorage, loadPlaylists, loadFavorites]);

  // Handle song changes
  useEffect(() => {
    if (currentSong) {
      console.log('Loading song:', currentSong.name);
      audioPlayer.loadSong(currentSong).then(() => {
        console.log('Song loaded successfully');
        // Auto-play when song is loaded
        if (isPlaying) {
          audioPlayer.play();
        }
      }).catch((error) => {
        console.error('Error loading song:', error);
      });
    }
  }, [currentSong?.id]);

  // Handle play/pause
  useEffect(() => {
    if (currentSong) {
      if (isPlaying) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
    }
  }, [isPlaying, currentSong]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
