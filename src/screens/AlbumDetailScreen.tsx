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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { searchService } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import { Song } from '../types';
import { getImageUrl } from '../utils/getImageUrl';
import { formatTime } from '../utils/formatTime';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = RouteProp<RootStackParamList, 'AlbumDetail'>;

const AlbumDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { albumId, albumName } = route.params;

  const [songs, setSongs] = useState<Song[]>([]);
  const [albumInfo, setAlbumInfo] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  const setQueue = usePlayerStore((state) => state.setQueue);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);

  useEffect(() => {
    loadAlbumData();
  }, [albumName]);

  const loadAlbumData = async () => {
    setLoading(true);
    try {
      const response = await searchService.searchAlbums(albumName, 1, 20);
      const isSuccess = response.status === 'SUCCESS' || response.status === 'success' || response.success === true;
      if (isSuccess && response.data?.results?.length > 0) {
        const album = response.data.results[0];
        setAlbumInfo(album);
        
        // Try to get songs from the album - since we don't have a direct endpoint,
        // we'll use search for songs from the album
        const songsResponse = await searchService.searchSongs(albumName, 1, 50);
        const songsSuccess = songsResponse.status === 'SUCCESS' || songsResponse.status === 'success' || songsResponse.success === true;
        if (songsSuccess && songsResponse.data?.results) {
          // Filter songs that belong to this album
          const albumSongs = songsResponse.data.results.filter(
            (song) => song.album?.name === albumName
          );
          setSongs(albumSongs.length > 0 ? albumSongs : songsResponse.data.results.slice(0, 20));
        }
      }
    } catch (error) {
      console.error('Error loading album data:', error);
    } finally {
      setLoading(false);
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

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
    const duration = typeof item.duration === 'string'
      ? parseInt(item.duration)
      : item.duration;

    return (
      <TouchableOpacity
        style={styles.songItem}
        onPress={() => handleSongPress(item, index)}
      >
        <View style={styles.songNumber}>
          <Text style={styles.songNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.primaryArtists}
          </Text>
        </View>
        <Text style={styles.songDuration}>{formatTime(duration)}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#B3B3B3" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!albumInfo) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Album not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={{ uri: getImageUrl(albumInfo.image, '500x500') }}
            style={styles.albumArt}
          />
          <Text style={styles.albumName}>{albumInfo.name}</Text>
          <Text style={styles.albumArtist}>{albumInfo.primaryArtists}</Text>
          {albumInfo.year && (
            <Text style={styles.albumInfo}>
              Album • {songs.length} Songs • {albumInfo.year}
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.shuffleButton]}
            onPress={handleShuffle}
          >
            <Ionicons name="shuffle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Shuffle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.playButton]}
            onPress={handlePlay}
          >
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Play</Text>
          </TouchableOpacity>
        </View>

        {songs.length > 0 && (
          <View style={styles.songsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Songs</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={songs}
              renderItem={renderSongItem}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              scrollEnabled={false}
              ListFooterComponent={<View style={{ height: 100 }} />}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  emptyText: {
    fontSize: 18,
    color: '#B3B3B3',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  albumArt: {
    width: 300,
    height: 300,
    borderRadius: 16,
    marginBottom: 16,
  },
  albumName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  albumArtist: {
    fontSize: 18,
    color: '#B3B3B3',
    marginBottom: 8,
    textAlign: 'center',
  },
  albumInfo: {
    fontSize: 14,
    color: '#666666',
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
    backgroundColor: '#1E1E1E',
  },
  playButton: {
    backgroundColor: '#FF6B35',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  songsSection: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  seeAll: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  songNumber: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  songNumberText: {
    fontSize: 16,
    color: '#666666',
  },
  songInfo: {
    flex: 1,
    marginRight: 12,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  songDuration: {
    fontSize: 12,
    color: '#666666',
    minWidth: 50,
    textAlign: 'right',
    marginRight: 8,
  },
  moreButton: {
    padding: 4,
  },
});

export default AlbumDetailScreen;
