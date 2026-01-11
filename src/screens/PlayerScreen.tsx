import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usePlayerStore } from '../stores/playerStore';
import { usePlaylistStore } from '../stores/playlistStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import { audioPlayer } from '../services/audioPlayer';
import { getImageUrl } from '../utils/getImageUrl';
import { formatTime } from '../utils/formatTime';
import { Ionicons } from '@expo/vector-icons';
import CustomSlider from '../components/CustomSlider';
import { useTheme } from '../hooks/useTheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const PlayerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  
  const currentSong = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const shuffle = usePlayerStore((state) => state.shuffle);
  const repeat = usePlayerStore((state) => state.repeat);
  
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const setRepeat = usePlayerStore((state) => state.setRepeat);
  const nextSong = usePlayerStore((state) => state.nextSong);
  const previousSong = usePlayerStore((state) => state.previousSong);
  const seek = usePlayerStore((state) => state.seek);

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [showSongMenu, setShowSongMenu] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const playlists = usePlaylistStore((state) => state.playlists);
  const createPlaylist = usePlaylistStore((state) => state.addPlaylist);
  const addSongToPlaylist = usePlaylistStore((state) => state.addSongToPlaylist);
  const removeSongFromPlaylist = usePlaylistStore((state) => state.removeSongFromPlaylist);
  const loadPlaylists = usePlaylistStore((state) => state.loadFromStorage);

  const favorites = useFavoritesStore((state) => state.favorites);
  const addToFavorites = useFavoritesStore((state) => state.addToFavorites);
  const removeFromFavorites = useFavoritesStore((state) => state.removeFromFavorites);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);

  useEffect(() => {
    setSeekValue(position);
  }, [position]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (value: number) => {
    setSeekValue(value);
  };

  const handleSeekComplete = async (value: number) => {
    setIsSeeking(false);
    await audioPlayer.seek(value);
    seek(value);
  };

  const handleRewind = async () => {
    if (!currentSong || duration === 0) return;
    const newPosition = Math.max(0, position - 10);
    await audioPlayer.seek(newPosition);
    seek(newPosition);
  };

  const handleFastForward = async () => {
    if (!currentSong || duration === 0) return;
    const newPosition = Math.min(duration, position + 10);
    await audioPlayer.seek(newPosition);
    seek(newPosition);
  };

  const handleRepeatPress = () => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeat);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeat(nextMode);
  };

  const getRepeatIcon = () => {
    switch (repeat) {
      case 'all':
        return 'repeat';
      case 'one':
        return 'repeat';
      default:
        return 'repeat-outline';
    }
  };

  const getRepeatColor = () => {
    return repeat !== 'none' ? colors.primary : colors.text;
  };

  const handleShowSongMenu = () => {
    setShowSongMenu(true);
  };

  const handleToggleFavorite = () => {
    if (currentSong) {
      if (isFavorite(currentSong.id)) {
        removeFromFavorites(currentSong.id);
        Alert.alert('Removed from Favorites', `${currentSong.name} has been removed from favorites`);
      } else {
        addToFavorites(currentSong);
        Alert.alert('Added to Favorites', `${currentSong.name} has been added to favorites`);
      }
    }
  };

  const handleShowPlaylistModal = () => {
    if (currentSong) {
      setShowPlaylistModal(true);
    }
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (currentSong) {
      const playlist = playlists.find(p => p.id === playlistId);
      const isInPlaylist = playlist?.songs.some(s => s.id === currentSong.id);
      
      if (isInPlaylist) {
        removeSongFromPlaylist(playlistId, currentSong.id);
        Alert.alert('Removed from Playlist', `${currentSong.name} has been removed from the playlist`);
      } else {
        addSongToPlaylist(playlistId, currentSong);
        Alert.alert('Added to Playlist', `${currentSong.name} has been added to the playlist`);
      }
      // Don't close modal - keep it open for multiple selections
    }
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim() && currentSong) {
      const playlistId = createPlaylist(newPlaylistName.trim());
      addSongToPlaylist(playlistId, currentSong);
      setNewPlaylistName('');
      setShowPlaylistModal(false);
      setShowSongMenu(false);
      Alert.alert('Playlist Created', `Created "${newPlaylistName.trim()}" and added song`);
    } else {
      Alert.alert('Error', 'Please enter a playlist name');
    }
  };

  const handleShowSongDetails = () => {
    if (currentSong) {
      setShowSongMenu(false);
      Alert.alert(
        currentSong.name,
        `Artist: ${currentSong.primaryArtists}\n` +
        `Album: ${currentSong.album?.name || 'Unknown'}\n` +
        `Year: ${currentSong.year || 'Unknown'}\n` +
        `Duration: ${formatTime(duration || 0)}\n` +
        `Language: ${currentSong.language || 'Unknown'}`,
        [{ text: 'OK' }]
      );
    }
  };

  const styles = getStyles(colors);

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-down" size={32} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No song playing</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={handleShowSongMenu}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.albumArtContainer}>
          <Image
            source={{ uri: getImageUrl(currentSong.image, '500x500') }}
            style={styles.albumArt}
          />
        </View>

        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {currentSong.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {currentSong.primaryArtists}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <CustomSlider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={isSeeking ? seekValue : position}
            onSlidingStart={handleSeekStart}
            onValueChange={handleSeekChange}
            onSlidingComplete={handleSeekComplete}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(isSeeking ? seekValue : position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              previousSong();
              // The song change will be handled by the useEffect in App.tsx
            }}
            disabled={!currentSong}
          >
            <Ionicons 
              name="play-skip-back" 
              size={28} 
              color={currentSong ? colors.text : colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rewindButton}
            onPress={handleRewind}
            disabled={!currentSong || duration === 0}
          >
            <View style={[styles.rewindCircle, { backgroundColor: currentSong && duration > 0 ? colors.surface : colors.border }]}>
              <Text style={[styles.rewindText, { color: currentSong && duration > 0 ? colors.text : colors.textSecondary }]}>10</Text>
            </View>
            <Ionicons 
              name="play-back" 
              size={20} 
              color={currentSong && duration > 0 ? colors.text : colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
            disabled={!currentSong}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={48}
              color={colors.background}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rewindButton}
            onPress={handleFastForward}
            disabled={!currentSong || duration === 0}
          >
            <View style={[styles.rewindCircle, { backgroundColor: currentSong && duration > 0 ? colors.surface : colors.border }]}>
              <Text style={[styles.rewindText, { color: currentSong && duration > 0 ? colors.text : colors.textSecondary }]}>10</Text>
            </View>
            <Ionicons 
              name="play-forward" 
              size={20} 
              color={currentSong && duration > 0 ? colors.text : colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              nextSong();
              // The song change will be handled by the useEffect in App.tsx
            }}
            disabled={!currentSong}
          >
            <Ionicons 
              name="play-skip-forward" 
              size={28} 
              color={currentSong ? colors.text : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.secondaryControls}>
          <TouchableOpacity
            style={[styles.controlButton, shuffle && styles.controlButtonActive]}
            onPress={toggleShuffle}
          >
            <Ionicons
              name="shuffle"
              size={24}
              color={shuffle ? colors.primary : colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, repeat !== 'none' && styles.controlButtonActive]}
            onPress={handleRepeatPress}
          >
            <Ionicons
              name={getRepeatIcon()}
              size={24}
              color={getRepeatColor()}
            />
            {repeat === 'one' && (
              <Text style={styles.repeatIndicator}>1</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => navigation.navigate('Queue')}
          >
            <Ionicons name="list" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={handleToggleFavorite}
            disabled={!currentSong}
          >
            <Ionicons 
              name={currentSong && isFavorite(currentSong.id) ? 'heart' : 'heart-outline'} 
              size={24} 
              color={currentSong && isFavorite(currentSong.id) ? colors.primary : colors.text} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={handleShowPlaylistModal}
            disabled={!currentSong}
          >
            <Ionicons 
              name="add-circle-outline" 
              size={24} 
              color={currentSong ? colors.text : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.lyricsButton}>
          <Ionicons name="chevron-up" size={20} color={colors.textSecondary} />
          <Text style={styles.lyricsText}>Lyrics</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showSongMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSongMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSongMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleShowSongDetails}
            >
              <Ionicons name="information-circle-outline" size={24} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Song Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowSongMenu(false);
                setShowPlaylistModal(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Add to Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemCancel]}
              onPress={() => setShowSongMenu(false)}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showPlaylistModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPlaylistModal(false)}
        >
          <View style={[styles.playlistModalContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add to Playlist</Text>
              <TouchableOpacity
                onPress={() => setShowPlaylistModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {playlists.length > 0 && (
              <View style={styles.existingPlaylistsSection}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Existing Playlists</Text>
                <ScrollView style={styles.playlistList} showsVerticalScrollIndicator={false}>
                  {playlists.map((playlist) => {
                    const isInPlaylist = currentSong && playlist.songs.some(s => s.id === currentSong.id);
                    return (
                      <TouchableOpacity
                        key={playlist.id}
                        style={[styles.playlistItem, { borderBottomColor: colors.border }]}
                        onPress={() => handleAddToPlaylist(playlist.id)}
                      >
                        <View style={[styles.playlistIconContainer, { backgroundColor: colors.background }]}>
                          <Ionicons name="musical-notes" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.playlistInfo}>
                          <Text style={[styles.playlistName, { color: colors.text }]} numberOfLines={1}>
                            {playlist.name}
                          </Text>
                          <Text style={[styles.playlistCount, { color: colors.textSecondary }]}>
                            {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
                          </Text>
                        </View>
                        {isInPlaylist ? (
                          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                        ) : (
                          <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <View style={[styles.createPlaylistSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Create New Playlist</Text>
              <View style={styles.createPlaylistContainer}>
                <TextInput
                  style={[styles.playlistInput, { 
                    backgroundColor: colors.background, 
                    color: colors.text, 
                    borderColor: colors.border 
                  }]}
                  placeholder="Enter playlist name"
                  placeholderTextColor={colors.textSecondary}
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                />
                <TouchableOpacity
                  style={[styles.createButton, { 
                    backgroundColor: colors.primary,
                    opacity: newPlaylistName.trim() ? 1 : 0.5
                  }]}
                  onPress={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                >
                  <Ionicons name="add" size={20} color={colors.background} />
                  <Text style={[styles.createButtonText, { color: colors.background }]}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  albumArtContainer: {
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  albumArt: {
    width: width - 64,
    height: width - 64,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  songInfo: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  artistName: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    width: width - 64,
    marginBottom: 32,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width - 64,
    marginBottom: 32,
    gap: 8,
  },
  navButton: {
    padding: 12,
  },
  rewindButton: {
    alignItems: 'center',
    padding: 8,
  },
  rewindCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  rewindText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  controlButton: {
    padding: 12,
    marginHorizontal: 8,
    position: 'relative',
  },
  controlButtonActive: {
    // Active state styling handled by icon color
  },
  repeatIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    fontSize: 10,
    color: colors.primary,
    fontWeight: 'bold',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
    width: '100%',
  },
  lyricsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  lyricsText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  playlistModalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  existingPlaylistsSection: {
    maxHeight: 300,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  playlistList: {
    maxHeight: 250,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  playlistIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
    marginRight: 12,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playlistCount: {
    fontSize: 14,
  },
  createPlaylistSection: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  createPlaylistContainer: {
    marginTop: 12,
  },
  playlistInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemCancel: {
    borderBottomWidth: 0,
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlayerScreen;
