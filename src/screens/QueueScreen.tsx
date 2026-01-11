import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usePlayerStore } from '../stores/playerStore';
import { Song } from '../types';
import { getImageUrl } from '../utils/getImageUrl';
import { formatTime } from '../utils/formatTime';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QueueScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const currentSong = usePlayerStore((state) => state.currentSong);
  
  const setQueue = usePlayerStore((state) => state.setQueue);
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue);
  const reorderQueue = usePlayerStore((state) => state.reorderQueue);
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);

  const handlePlaySong = (song: Song, index: number) => {
    setQueue(queue, index);
    navigation.navigate('Player');
  };

  const handleRemoveSong = (index: number) => {
    Alert.alert(
      'Remove Song',
      'Are you sure you want to remove this song from the queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromQueue(index),
        },
      ]
    );
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderQueue(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < queue.length - 1) {
      reorderQueue(index, index + 1);
    }
  };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
    const isCurrent = index === currentIndex;
    
    return (
      <TouchableOpacity
        style={[
          styles.queueItem,
          isCurrent && styles.currentQueueItem,
        ]}
        onPress={() => handlePlaySong(item, index)}
      >
        <Image
          source={{ uri: getImageUrl(item.image, '150x150') }}
          style={styles.queueThumbnail}
        />
        
        <View style={styles.queueInfo}>
          <Text
            style={[styles.queueTitle, isCurrent && styles.currentQueueTitle]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={styles.queueArtist} numberOfLines={1}>
            {item.primaryArtists}
          </Text>
        </View>

        <View style={styles.queueActions}>
          {typeof item.duration === 'string' ? (
            <Text style={styles.queueDuration}>
              {formatTime(parseInt(item.duration))}
            </Text>
          ) : (
            <Text style={styles.queueDuration}>
              {formatTime(item.duration)}
            </Text>
          )}
          
          {isCurrent && (
            <View style={styles.currentIndicator}>
              <Ionicons name="play" size={16} color="#FF6B35" />
            </View>
          )}

          <View style={styles.reorderButtons}>
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={() => handleMoveUp(index)}
              disabled={index === 0}
            >
              <Ionicons 
                name="chevron-up" 
                size={20} 
                color={index === 0 ? '#333333' : '#B3B3B3'} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={() => handleMoveDown(index)}
              disabled={index === queue.length - 1}
            >
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={index === queue.length - 1 ? '#333333' : '#B3B3B3'} 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveSong(index)}
          >
            <Ionicons name="close" size={20} color="#B3B3B3" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (queue.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="list-outline" size={64} color="#666666" />
        <Text style={styles.emptyTitle}>Queue is Empty</Text>
        <Text style={styles.emptyText}>
          Add songs to your queue to see them here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Queue</Text>
        <Text style={styles.queueCount}>{queue.length} songs</Text>
      </View>

      <FlatList
        data={queue}
        renderItem={renderSongItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  queueCount: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  currentQueueItem: {
    backgroundColor: '#2A1E1E',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  queueThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 4,
    marginRight: 12,
  },
  queueInfo: {
    flex: 1,
    marginRight: 8,
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  currentQueueTitle: {
    color: '#FF6B35',
  },
  queueArtist: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  queueActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  queueDuration: {
    fontSize: 12,
    color: '#666666',
    minWidth: 40,
  },
  currentIndicator: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    padding: 4,
  },
  reorderButtons: {
    flexDirection: 'column',
    marginRight: 8,
  },
  reorderButton: {
    padding: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
  },
});

export default QueueScreen;
