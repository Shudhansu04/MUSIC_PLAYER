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
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { searchService } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import { Song } from '../types';
import { getImageUrl } from '../utils/getImageUrl';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'suggested' | 'songs' | 'artists' | 'albums' | 'playlists';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('suggested');
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [topArtists, setTopArtists] = useState<Song[]>([]);
  const [mostPlayed, setMostPlayed] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [allArtists, setAllArtists] = useState<any[]>([]);
  const [allAlbums, setAllAlbums] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const setQueue = usePlayerStore((state) => state.setQueue);

  useEffect(() => {
    loadHomeData();
  }, []);

  useEffect(() => {
    if (activeTab === 'songs') {
      loadSongs();
    } else if (activeTab === 'artists') {
      loadArtists();
    } else if (activeTab === 'albums') {
      loadAlbums();
    }
  }, [activeTab]);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      // Use popular search terms that will return results
      const [songsResponse, artistsResponse] = await Promise.all([
        searchService.searchSongs('hindi', 1, 20),
        searchService.searchArtists('hindi', 1, 10),
      ]);

      const songsSuccess = songsResponse.status === 'SUCCESS' || songsResponse.status === 'success' || songsResponse.success === true;
      if (songsSuccess && songsResponse.data?.results?.length > 0) {
        const results = songsResponse.data.results;
        setRecentlyPlayed(results.slice(0, 6));
        setMostPlayed(results.slice(6, 12));
      }

      const artistsSuccess = artistsResponse.status === 'SUCCESS' || artistsResponse.status === 'success' || artistsResponse.success === true;
      if (artistsSuccess && artistsResponse.data?.results?.length > 0) {
        setTopArtists(artistsResponse.data.results.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSongs = async (page: number = 1, append: boolean = false) => {
    if (!append && allSongs.length > 0) return;
    setLoading(true);
    try {
      // Use a broad search query to get many songs - load more pages
      const response = await searchService.searchSongs('song', page, 100);
      const isSuccess = response.status === 'SUCCESS' || response.status === 'success' || response.success === true;
      if (isSuccess && response.data?.results?.length > 0) {
        if (append) {
          setAllSongs(prev => [...prev, ...response.data.results]);
        } else {
          setAllSongs(response.data.results);
        }
      }
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArtists = async (page: number = 1, append: boolean = false) => {
    if (!append && allArtists.length > 0) return;
    setLoading(true);
    try {
      const response = await searchService.searchArtists('singer', page, 100);
      const isSuccess = response.status === 'SUCCESS' || response.status === 'success' || response.success === true;
      if (isSuccess && response.data?.results?.length > 0) {
        if (append) {
          setAllArtists(prev => [...prev, ...response.data.results]);
        } else {
          setAllArtists(response.data.results);
        }
      }
    } catch (error) {
      console.error('Error loading artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlbums = async () => {
    if (allAlbums.length > 0) return;
    setLoading(true);
    try {
      const response = await searchService.searchAlbums('album', 1, 50);
      const isSuccess = response.status === 'SUCCESS' || response.status === 'success' || response.success === true;
      if (isSuccess && response.data?.results?.length > 0) {
        setAllAlbums(response.data.results);
      }
    } catch (error) {
      console.error('Error loading albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSongPress = (song: Song) => {
    setQueue([song], 0);
    navigation.navigate('Player');
  };

  const handleArtistPress = async (artistId: string, artistName: string) => {
    navigation.navigate('ArtistDetail', { artistId, artistName });
  };

  const handleAlbumPress = (albumId: string, albumName: string) => {
    navigation.navigate('AlbumDetail', { albumId, albumName });
  };

  const handleSeeAll = (songs: Song[], title: string) => {
    navigation.navigate('SongList', { title, songs });
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handleSongPress(item)}
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
          {item.primaryArtists}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: any }) => {
    const artistId = item.primaryArtistsId?.split(',')[0] || item.id;
    const artistName = item.primaryArtists?.split(',')[0] || item.name;
    return (
      <TouchableOpacity
        style={styles.artistItem}
        onPress={() => handleArtistPress(artistId, artistName)}
      >
        <Image
          source={{ uri: getImageUrl(item.image, '150x150') }}
          style={styles.artistThumbnail}
        />
        <Text style={styles.artistName} numberOfLines={1}>
          {artistName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAlbumItem = ({ item }: { item: any }) => {
    // Albums from search API have name and id directly, not nested in album property
    const albumId = item.id;
    const albumName = item.name || item.album?.name || 'Unknown Album';
    const albumArtists = item.primaryArtists || item.artists?.primary?.[0]?.name || 'Unknown Artist';
    const albumYear = item.year || '';
    
    return (
      <TouchableOpacity
        style={styles.albumItem}
        onPress={() => handleAlbumPress(albumId, albumName)}
      >
        <Image
          source={{ uri: getImageUrl(item.image, '500x500') }}
          style={styles.albumThumbnail}
        />
        <Text style={styles.albumTitle} numberOfLines={1}>
          {albumName}
        </Text>
        <Text style={styles.albumArtist} numberOfLines={1}>
          {albumArtists} {albumYear ? `| ${albumYear}` : ''}
        </Text>
        <Text style={styles.albumSongs}>{item.songCount || 'Songs'}</Text>
      </TouchableOpacity>
    );
  };

  const renderSongListItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity
      style={styles.songListItem}
      onPress={() => handleSongPress(item)}
    >
      <Image
        source={{ uri: getImageUrl(item.image, '150x150') }}
        style={styles.songListThumbnail}
      />
      <View style={styles.songListInfo}>
        <Text style={styles.songListTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.songListArtist} numberOfLines={1}>
          {item.primaryArtists}
        </Text>
      </View>
      <Text style={styles.songDuration}>
        {typeof item.duration === 'string' 
          ? `${Math.floor(parseInt(item.duration) / 60)}:${String(parseInt(item.duration) % 60).padStart(2, '0')} mins`
          : `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')} mins`}
      </Text>
      <TouchableOpacity 
        style={styles.playIconButton}
        onPress={() => handleSongPress(item)}
      >
        <Ionicons name="play-circle" size={24} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderArtistListItem = ({ item }: { item: any }) => {
    const artistId = item.primaryArtistsId?.split(',')[0] || item.id;
    const artistName = item.primaryArtists?.split(',')[0] || item.name;
    return (
      <TouchableOpacity
        style={styles.artistListItem}
        onPress={() => handleArtistPress(artistId, artistName)}
      >
        <Image
          source={{ uri: getImageUrl(item.image, '150x150') }}
          style={styles.artistListThumbnail}
        />
        <View style={styles.artistListInfo}>
          <Text style={styles.artistListName} numberOfLines={1}>
            {artistName}
          </Text>
          <Text style={styles.artistListDetails}>
            {item.album ? '1 Album | 20 Songs' : '1 Album | 20 Songs'}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderSuggestedContent = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {recentlyPlayed.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Played</Text>
            <TouchableOpacity onPress={() => handleSeeAll(recentlyPlayed, 'Recently Played')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentlyPlayed}
            renderItem={renderSongItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {topArtists.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Artists</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={topArtists}
            renderItem={renderArtistItem}
            keyExtractor={(item, index) => item.id || `artist-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {mostPlayed.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Most Played</Text>
            <TouchableOpacity onPress={() => handleSeeAll(mostPlayed, 'Most Played')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={mostPlayed}
            renderItem={renderSongItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </ScrollView>
  );

  const renderSongsContent = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabCount}>{allSongs.length} songs</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Date Modified</Text>
          <Ionicons name="swap-vertical" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={allSongs}
        renderItem={renderSongListItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (!loading && allSongs.length > 0) {
            const nextPage = Math.floor(allSongs.length / 100) + 1;
            loadSongs(nextPage, true);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );

  const renderArtistsContent = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabCount}>{allArtists.length} artists</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Date Added</Text>
          <Ionicons name="swap-vertical" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={allArtists}
        renderItem={renderArtistListItem}
        keyExtractor={(item, index) => item.id || `artist-${index}`}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (!loading && allArtists.length > 0) {
            const nextPage = Math.floor(allArtists.length / 100) + 1;
            loadArtists(nextPage, true);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );

  const renderAlbumsContent = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabCount}>{allAlbums.length} albums</Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Date Modified</Text>
          <Ionicons name="swap-vertical" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={allAlbums}
        renderItem={renderAlbumItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.albumGrid}
        columnWrapperStyle={styles.albumRow}
      />
    </View>
  );

  const styles = getStyles(colors);

  if (loading && recentlyPlayed.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Ionicons name="musical-notes" size={24} color={colors.primary} />
            <Text style={styles.logoText}>Mume</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Search' as any)}>
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabs}>
          {(['suggested', 'songs', 'artists', 'albums', 'playlists'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === 'suggested' && renderSuggestedContent()}
      {activeTab === 'songs' && renderSongsContent()}
      {activeTab === 'artists' && renderArtistsContent()}
      {activeTab === 'albums' && renderAlbumsContent()}
      {activeTab === 'playlists' && (
        <View style={styles.emptyTab}>
          <Text style={styles.emptyText}>Playlists coming soon</Text>
        </View>
      )}
    </SafeAreaView>
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
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  songItem: {
    width: 140,
    marginRight: 12,
  },
  songThumbnail: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  songInfo: {
    marginTop: 4,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  artistItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 100,
  },
  artistThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  artistName: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  albumItem: {
    width: '48%',
    marginBottom: 16,
  },
  albumThumbnail: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  albumSongs: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tabContent: {
    flex: 1,
    paddingTop: 16,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tabCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  songListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  songListThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: colors.surface,
  },
  songListInfo: {
    flex: 1,
    marginRight: 8,
  },
  songListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  songListArtist: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  songDuration: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 12,
  },
  playIconButton: {
    padding: 4,
    marginRight: 8,
  },
  moreButton: {
    padding: 4,
  },
  artistListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  artistListThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: colors.surface,
  },
  artistListInfo: {
    flex: 1,
  },
  artistListName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  artistListDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  albumGrid: {
    paddingHorizontal: 16,
  },
  albumRow: {
    justifyContent: 'space-between',
  },
  emptyTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default HomeScreen;
