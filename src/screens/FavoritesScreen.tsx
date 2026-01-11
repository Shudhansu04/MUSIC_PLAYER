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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useFavoritesStore } from '../stores/favoritesStore';
import { usePlayerStore } from '../stores/playerStore';
import { useTheme } from '../hooks/useTheme';
import { getImageUrl } from '../utils/getImageUrl';
import { formatTime } from '../utils/formatTime';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const favorites = useFavoritesStore((state) => state.favorites);
  const loadFavorites = useFavoritesStore((state) => state.loadFromStorage);
  const setQueue = usePlayerStore((state) => state.setQueue);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleSongPress = (song: Song, index: number) => {
    if (!song.downloadUrl || song.downloadUrl.length === 0) {
      return;
    }
    setQueue(favorites, index);
    navigation.navigate('Player');
  };

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      setQueue(favorites, 0);
      navigation.navigate('Player');
    }
  };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
    const duration = typeof item.duration === 'string'
      ? parseInt(item.duration)
      : item.duration;

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
          <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.primaryArtists} • {item.album?.name || 'Unknown Album'}
          </Text>
        </View>
        <Text style={[styles.songDuration, { color: colors.textSecondary }]}>
          {formatTime(duration)}
        </Text>
      </TouchableOpacity>
    );
  };

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {favorites.length} {favorites.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Add songs to favorites from the player screen
          </Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.playAllButton, { backgroundColor: colors.surface }]}
            onPress={handlePlayAll}
          >
            <Ionicons name="play-circle" size={32} color={colors.primary} />
            <Text style={[styles.playAllText, { color: colors.primary }]}>Play All</Text>
          </TouchableOpacity>
          <FlatList
            data={favorites}
            renderItem={renderSongItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.listContent}
          />
        </>
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
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  playAllText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  songThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: colors.surface,
  },
  songInfo: {
    flex: 1,
    marginRight: 8,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
  },
  songDuration: {
    fontSize: 12,
    minWidth: 40,
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
});

export default FavoritesScreen;
