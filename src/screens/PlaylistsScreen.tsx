import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usePlaylistStore } from '../stores/playlistStore';
import { useTheme } from '../hooks/useTheme';
import { getImageUrl } from '../utils/getImageUrl';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../stores/playerStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PlaylistsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const playlists = usePlaylistStore((state) => state.playlists);
  const loadPlaylists = usePlaylistStore((state) => state.loadFromStorage);
  const setQueue = usePlayerStore((state) => state.setQueue);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);
   
  const removePlaylist = usePlaylistStore((state) => state.removePlaylist);

  const handleDeletePlaylist = (playlist: any, e: any) => {
  e.stopPropagation();
  Alert.alert(
    'Delete Playlist',
    `Are you sure you want to delete "${playlist.name}"?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removePlaylist(playlist.id),
      },
    ]
  );
};

  const handlePlaylistPress = (playlist: any) => {
    if (playlist.songs.length > 0) {
      navigation.navigate('SongList', {
        title: playlist.name,
        songs: playlist.songs,
      });
    }
  };

  const handlePlayPlaylist = (playlist: any, e: any) => {
    e.stopPropagation();
    if (playlist.songs.length > 0) {
      setQueue(playlist.songs, 0);
      navigation.navigate('Player');
    }
  };

  const renderPlaylistItem = ({ item }: { item: any }) => {
    const firstSongImage = item.songs.length > 0 ? item.songs[0].image : null;
    
    return (
      <TouchableOpacity
        style={[styles.playlistItem, { borderBottomColor: colors.border }]}
        onPress={() => handlePlaylistPress(item)}
      >
        {firstSongImage ? (
          <Image
            source={{ uri: getImageUrl(firstSongImage, '150x150') }}
            style={styles.playlistThumbnail}
          />
        ) : (
          <View style={[styles.playlistThumbnail, { backgroundColor: colors.surface }]}>
            <Ionicons name="musical-notes" size={32} color={colors.textSecondary} />
          </View>
        )}
        <View style={styles.playlistInfo}>
          <Text style={[styles.playlistName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.playlistCount, { color: colors.textSecondary }]}>
            {item.songs.length} {item.songs.length === 1 ? 'song' : 'songs'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playButton}
          onPress={(e) => handlePlayPlaylist(item, e)}
          disabled={item.songs.length === 0}
        >
          <Ionicons
            name="play-circle"
            size={32}
            color={item.songs.length > 0 ? colors.primary : colors.textSecondary}
          />
          <TouchableOpacity
  style={styles.deleteButton}
  onPress={(e) => handleDeletePlaylist(item, e)}
>
  <Ionicons name="trash-outline" size={24} color={colors.error || '#FF3B30'} />
</TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Playlists</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
        </Text>
      </View>

      {playlists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No playlists yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Create playlists from the player screen
          </Text>
        </View>
      ) : (
        <FlatList
          data={playlists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  listContent: {
    paddingVertical: 8,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  playlistThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  playButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  deleteButton: {
  padding: 8,
},
});

export default PlaylistsScreen;
