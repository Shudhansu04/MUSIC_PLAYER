import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlayerStore } from '../stores/playerStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../utils/getImageUrl';
import { formatTime } from '../utils/formatTime';
import { useTheme } from '../hooks/useTheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MiniPlayer: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const currentSong = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);

  if (!currentSong) {
    return null;
  }

  const handlePress = () => {
    navigation.navigate('Player');
  };

  const handlePlayPause = (e: any) => {
    e.stopPropagation();
    togglePlayPause();
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;
  const styles = getStyles(colors);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      
      <View style={styles.content}>
        <Image
          source={{ uri: getImageUrl(currentSong.image, '150x150') }}
          style={styles.thumbnail}
        />
        
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.name}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.primaryArtists}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handlePlayPause}
          style={styles.playButton}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  playButton: {
    padding: 8,
  },
});

export default MiniPlayer;
