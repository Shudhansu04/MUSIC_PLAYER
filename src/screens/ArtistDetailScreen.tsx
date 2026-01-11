import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { artistService } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import { usePlaylistStore } from '../stores/playlistStore';
import { Song } from '../types';
import { getImageUrl } from '../utils/getImageUrl';
import { formatTime } from '../utils/formatTime';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = RouteProp<RootStackParamList, 'ArtistDetail'>;

const ArtistDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { artistId, artistName } = route.params;
  const { colors } = useTheme();

  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistInfo, setArtistInfo] = useState<any>(null);
  const [showSongMenu, setShowSongMenu] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [totalSongs, setTotalSongs] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const setQueue = usePlayerStore((state) => state.setQueue);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const shuffle = usePlayerStore((state) => state.shuffle);
  const playlists = usePlaylistStore((state) => state.playlists);
  const createPlaylist = usePlaylistStore((state) => state.addPlaylist);
  const addSongToPlaylist = usePlaylistStore((state) => state.addSongToPlaylist);
  const removeSongFromPlaylist = usePlaylistStore((state) => state.removeSongFromPlaylist);
  const loadPlaylists = usePlaylistStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadArtistData();
    loadPlaylists();
  }, [artistId, loadPlaylists]);

  const loadArtistData = async (page: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const [songsResponse, albumsResponse, artistResponse] = await Promise.all([
        artistService.getArtistSongs(artistId, page, 100), // Load 100 songs per page
        page === 1 ? artistService.getArtistAlbums(artistId, 1, 20) : Promise.resolve(null),
        page === 1 ? artistService.getArtist(artistId) : Promise.resolve(null),
      ]);

      console.log('Artist Songs Response:', JSON.stringify(songsResponse, null, 2));

      // Handle different response structures
      const songsSuccess = songsResponse.status === 'SUCCESS' || songsResponse.status === 'success' || songsResponse.success === true;
      if (songsSuccess) {
        // Check multiple possible locations for songs array
        const newSongs = songsResponse.data?.songs || 
                         songsResponse.data?.results || 
                         songsResponse.songs || 
                         songsResponse.results || 
                         songsResponse.data || 
                         [];
        const total = songsResponse.data?.total || songsResponse.total || newSongs.length;
        
        if (Array.isArray(newSongs) && newSongs.length > 0) {
          console.log(`Loaded ${newSongs.length} songs for artist (page ${page})`);
          if (append) {
            setSongs(prev => [...prev, ...newSongs]);
          } else {
            setSongs(newSongs);
            setTotalSongs(total);
          }
        } else {
          console.warn('No songs found in response. Available keys:', Object.keys(songsResponse.data || songsResponse || {}));
        }
      } else {
        console.warn('Songs API response not successful:', songsResponse);
      }

      // Only load albums and artist info on first page
      if (page === 1) {
        if (albumsResponse) {
          const albumsSuccess = albumsResponse.status === 'SUCCESS' || albumsResponse.status === 'success' || albumsResponse.success === true;
          if (albumsSuccess) {
            const albums = albumsResponse.data?.results || albumsResponse.results || albumsResponse.data || [];
            if (Array.isArray(albums)) {
              setAlbums(albums);
            }
          }
        }

        if (artistResponse) {
          if (artistResponse.data) {
            setArtistInfo(artistResponse.data);
          } else {
            setArtistInfo(artistResponse);
          }
        }
      }
    } catch (error) {
      console.error('Error loading artist data:', error);
    } finally {
      if (!append) {
        setLoading(false);
      }
      setLoadingMore(false);
    }
  };

  const loadMoreSongs = () => {
    if (!loadingMore && songs.length < totalSongs) {
      const nextPage = Math.floor(songs.length / 100) + 1;
      loadArtistData(nextPage, true);
    }
  };

  const handlePlay = () => {
    if (songs.length > 0) {
      setQueue(songs, 0);
      navigation.navigate('Player');
    }
  };

  const handleShuffle = () => {
    if (songs.length > 0) {
      toggleShuffle();
      const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
      setQueue(shuffledSongs, 0);
      navigation.navigate('Player');
    }
  };

  const handleSongPress = (song: Song, index: number) => {
    setQueue(songs, index);
    navigation.navigate('Player');
  };

  const handleAddToQueue = (song: Song, e: any) => {
    e.stopPropagation();
    addToQueue(song);
    Alert.alert('Added to Queue', `${song.name} has been added to the queue`);
  };

  const handleShowSongMenu = (song: Song, e: any) => {
    e.stopPropagation();
    setSelectedSong(song);
    setShowSongMenu(true);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (selectedSong) {
      const playlist = playlists.find(p => p.id === playlistId);
      const isInPlaylist = playlist?.songs.some(s => s.id === selectedSong.id);
      
      if (isInPlaylist) {
        removeSongFromPlaylist(playlistId, selectedSong.id);
        Alert.alert('Removed from Playlist', `${selectedSong.name} has been removed from the playlist`);
      } else {
        addSongToPlaylist(playlistId, selectedSong);
        Alert.alert('Added to Playlist', `${selectedSong.name} has been added to the playlist`);
      }
      // Don't close modal - keep it open for multiple selections
    }
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      const playlistId = createPlaylist(newPlaylistName.trim());
      if (selectedSong) {
        addSongToPlaylist(playlistId, selectedSong);
      }
      setNewPlaylistName('');
      setShowPlaylistModal(false);
      setShowSongMenu(false);
      Alert.alert('Playlist Created', `Created "${newPlaylistName.trim()}" and added song`);
    } else {
      Alert.alert('Error', 'Please enter a playlist name');
    }
  };

  const handleShowSongDetails = () => {
    if (selectedSong) {
      setShowSongMenu(false);
      Alert.alert(
        selectedSong.name,
        `Artist: ${selectedSong.primaryArtists}\n` +
        `Album: ${selectedSong.album?.name || 'Unknown'}\n` +
        `Year: ${selectedSong.year || 'Unknown'}\n` +
        `Duration: ${formatTime(typeof selectedSong.duration === 'string' ? parseInt(selectedSong.duration) : selectedSong.duration)}`,
        [{ text: 'OK' }]
      );
    }
  };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
    const duration = typeof item.duration === 'string' ? parseInt(item.duration) : item.duration;
    return (
      <TouchableOpacity
        style={[styles.songItem, { borderBottomColor: colors.border }]}
        onPress={() => handleSongPress(item, index)}
      >
        <Image
          source={{ uri: getImageUrl(item.image, '150x150') }}
          style={styles.songThumbnail}
        />
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.songSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.album?.name || 'Unknown Album'} • {formatTime(duration)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={(e) => handleAddToQueue(item, e)}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={(e) => handleShowSongMenu(item, e)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderAlbumItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={styles.albumItem}
      onPress={() => {
        // Navigate to album detail if implemented
      }}
    >
      <Image
        source={{ uri: getImageUrl(item.image, '300x300') }}
        style={styles.albumThumbnail}
      />
      <Text style={[styles.albumTitle, { color: colors.text }]} numberOfLines={1}>
        {item.name}
      </Text>
      {item.year && (
        <Text style={[styles.albumYear, { color: colors.textSecondary }]}>{item.year}</Text>
      )}
    </TouchableOpacity>
  );

  const styles = getStyles(colors);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const artistImage = artistInfo?.image 
    ? getImageUrl(artistInfo.image, '500x500')
    : getImageUrl(songs[0]?.image || [], '500x500');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={{ uri: artistImage }}
            style={styles.artistImage}
          />
          <Text style={styles.artistName}>{artistName}</Text>
          {artistInfo && (
            <Text style={styles.artistInfo}>
              {songs.length} Songs • {albums.length} Albums
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.shuffleButton]}
            onPress={handleShuffle}
          >
            <Ionicons name="shuffle" size={20} color={colors.background} />
            <Text style={styles.actionButtonText}>Shuffle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.playButton]}
            onPress={handlePlay}
          >
            <Ionicons name="play" size={20} color={colors.background} />
            <Text style={styles.actionButtonText}>Play</Text>
          </TouchableOpacity>
        </View>

        {songs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Songs ({songs.length})</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SongList', { title: `${artistName}'s Songs`, songs: songs })}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={songs}
              renderItem={renderSongItem}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              scrollEnabled={false}
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.loadingMore}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : songs.length < totalSongs && totalSongs > 0 ? (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={loadMoreSongs}
                  >
                    <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                      Load More ({totalSongs - songs.length} remaining)
                    </Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          </View>
        )}
        
        {songs.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No songs found for this artist</Text>
          </View>
        )}

        {albums.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Albums</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={albums}
              renderItem={renderAlbumItem}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumsList}
              scrollEnabled={true}
            />
          </View>
        )}
      </ScrollView>

      {/* Song Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSongMenu}
        onRequestClose={() => setShowSongMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSongMenu(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleShowSongDetails}>
              <Ionicons name="information-circle-outline" size={24} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Song Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
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

      {/* Add to Playlist Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPlaylistModal}
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPlaylistModal(false)}
        >
          <View style={[styles.playlistModalContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text, borderBottomColor: colors.border }]}>
              Add to Playlist
            </Text>
            <ScrollView style={styles.playlistList}>
              {playlists.map((playlist) => {
                const isInPlaylist = selectedSong && playlist.songs.some(s => s.id === selectedSong.id);
                return (
                  <TouchableOpacity
                    key={playlist.id}
                    style={[styles.playlistItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleAddToPlaylist(playlist.id)}
                  >
                    <View style={styles.playlistInfo}>
                      <Text style={[styles.playlistName, { color: colors.text }]}>{playlist.name}</Text>
                      <Text style={[styles.playlistCount, { color: colors.textSecondary }]}>
                        {playlist.songs.length} songs
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
            <View style={[styles.createPlaylistContainer, { borderTopColor: colors.border }]}>
              <TextInput
                style={[styles.playlistInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="New playlist name"
                placeholderTextColor={colors.textSecondary}
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
              />
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.primary }]}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.createButtonText}>Create & Add</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowPlaylistModal(false);
                setShowSongMenu(false);
              }}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
  },
  artistImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 16,
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  artistInfo: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  shuffleButton: {
    backgroundColor: colors.surface,
  },
  playButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  addButton: {
    padding: 4,
    marginRight: 8,
  },
  moreButton: {
    padding: 4,
  },
  songThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 4,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
    marginRight: 12,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  songSubtitle: {
    fontSize: 14,
  },
  albumsList: {
    paddingHorizontal: 16,
  },
  albumItem: {
    width: 140,
    marginRight: 12,
  },
  albumThumbnail: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  albumYear: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
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
  playlistModalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  playlistList: {
    maxHeight: 400,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playlistCount: {
    fontSize: 14,
  },
  createPlaylistContainer: {
    padding: 20,
    borderTopWidth: 1,
    marginTop: 10,
  },
  playlistInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  createButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ArtistDetailScreen;
