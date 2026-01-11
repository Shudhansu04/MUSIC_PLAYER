import { Audio } from 'expo-av';
import { usePlayerStore } from '../stores/playerStore';
import { Song } from '../types';

class AudioPlayerService {
  private sound: Audio.Sound | null = null;
  private positionUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to initialize audio mode:', error);
    }
  }

  async loadSong(song: Song): Promise<void> {
    try {
      // Unload previous song
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      // Get the best quality download URL (prefer 320kbps, fallback to lower quality)
      // API returns both 'link' and 'url' properties
      const downloadUrl = song.downloadUrl?.find((url) => url.quality === '320kbps')?.link ||
                          song.downloadUrl?.find((url) => url.quality === '320kbps')?.url ||
                          song.downloadUrl?.find((url) => url.quality === '160kbps')?.link ||
                          song.downloadUrl?.find((url) => url.quality === '160kbps')?.url ||
                          song.downloadUrl?.find((url) => url.quality === '96kbps')?.link ||
                          song.downloadUrl?.find((url) => url.quality === '96kbps')?.url ||
                          song.downloadUrl?.find((url) => url.quality === '48kbps')?.link ||
                          song.downloadUrl?.find((url) => url.quality === '48kbps')?.url ||
                          song.downloadUrl?.[0]?.link ||
                          song.downloadUrl?.[0]?.url;

      if (!downloadUrl) {
        console.error('No download URL available for song:', song.name);
        console.error('Download URLs:', song.downloadUrl);
        throw new Error('No download URL available for this song');
      }

      console.log('Loading song:', song.name, 'URL:', downloadUrl);

      // Load new song
      const store = usePlayerStore.getState();
      const { sound } = await Audio.Sound.createAsync(
        { uri: downloadUrl },
        { shouldPlay: store.isPlaying },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;

      // Set up position update interval
      this.startPositionUpdates();
      
      // Auto-play if store says it should be playing
      if (store.isPlaying) {
        await this.play();
      }
    } catch (error) {
      console.error('Error loading song:', error);
      // Note: setError doesn't exist in playerStore, we can add it if needed
    }
  }

  async play(): Promise<void> {
    try {
      if (this.sound) {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) {
          await this.sound.playAsync();
          usePlayerStore.getState().setPlaying(true);
        } else {
          console.warn('Sound is not loaded, cannot play');
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  async pause(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        usePlayerStore.getState().setPlaying(false);
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        usePlayerStore.getState().setPlaying(false);
      }
      this.stopPositionUpdates();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  async seek(position: number): Promise<void> {
    try {
      if (this.sound) {
        const positionMillis = position * 1000; // Convert seconds to milliseconds
        await this.sound.setPositionAsync(positionMillis);
        usePlayerStore.getState().setPosition(position);
      }
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  }

  private onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      const store = usePlayerStore.getState();
      
      if (status.positionMillis !== null) {
        store.setPosition(status.positionMillis / 1000); // Convert to seconds
      }
      if (status.durationMillis !== null) {
        store.setDuration(status.durationMillis / 1000); // Convert to seconds
      }

      // Handle playback finish
      if (status.didJustFinish) {
        this.handlePlaybackFinish();
      }

      // Update playing state
      if (status.isPlaying !== store.isPlaying) {
        store.setPlaying(status.isPlaying);
      }
    } else if (status.error) {
      console.error('Playback error:', status.error);
      // Note: setError doesn't exist in playerStore
    }
  };

  private handlePlaybackFinish(): void {
    const store = usePlayerStore.getState();
    const { repeat, currentIndex, queue } = store;

    if (repeat === 'one') {
      // Repeat current song
      this.seek(0);
      this.play();
    } else {
      // Move to next song
      store.nextSong();
      const nextSong = usePlayerStore.getState().currentSong;
      if (nextSong) {
        this.loadSong(nextSong);
      } else {
        this.stop();
      }
    }
  }

  private startPositionUpdates(): void {
    this.stopPositionUpdates();
    this.positionUpdateInterval = setInterval(() => {
      const store = usePlayerStore.getState();
      if (this.sound && store.isPlaying) {
        this.sound.getStatusAsync().then((status) => {
          if (status.isLoaded && status.positionMillis !== null) {
            store.setPosition(status.positionMillis / 1000);
          }
        });
      }
    }, 500);
  }

  private stopPositionUpdates(): void {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
      this.positionUpdateInterval = null;
    }
  }

  async unload(): Promise<void> {
    this.stopPositionUpdates();
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }
}

export const audioPlayer = new AudioPlayerService();
