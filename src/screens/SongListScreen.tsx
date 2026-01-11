import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usePlayerStore } from '../stores/playerStore';
import { Song } from '../types';
import { getImageUrl } from '../utils/getImageUrl';
import { formatTime } from '../utils/formatTime';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = RouteProp<RootStackParamList, 'SongList'>;

const SongListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { title, songs } = route.params;
  const { colors } = useTheme();

  const setQueue = usePlayerStore((state) => state.setQueue);

  const handleSongPress = (song: Song, index: number) => {
    setQueue(songs, index);
    navigation.navigate('Player');
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs, 0);
      navigation.navigate('Player');
    }
  };

  const handleAddToQueue = (song: Song) => {
    const addToQueue = usePlayerStore.getState().addToQueue;
    addToQueue(song);
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
        <Image
          source={{ uri: getImageUrl(item.image, '150x150') }}
          style={styles.songThumbnail}
        />
        
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.primaryArtists} • {item.album?.name || 'Unknown Album'}
          </Text>
        </View>

        <View style={styles.songActions}>
          <Text style={styles.songDuration}>{formatTime(duration)}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToQueue(item)}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.songCount}>{songs.length} songs</Text>
      </View>

      {songs.length > 0 && (
        <TouchableOpacity style={styles.playAllButton} onPress={handlePlayAll}>
          <Ionicons name="play-circle" size={32} color={colors.primary} />
          <Text style={styles.playAllText}>Play All</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={songs}
        renderItem={renderSongItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
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
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  songCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  playAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
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
    borderBottomColor: colors.border,
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
    color: colors.text,
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  songDuration: {
    fontSize: 12,
    color: colors.textSecondary,
    minWidth: 40,
  },
  addButton: {
    padding: 4,
  },
});

export default SongListScreen;
