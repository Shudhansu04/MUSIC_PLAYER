import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { searchService } from '../services/api';
import { useSearchStore } from '../stores/searchStore';
import { usePlayerStore } from '../stores/playerStore';
import { Song } from '../types';
import { getImageUrl } from '../utils/getImageUrl';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'songs' | 'artists' | 'albums' | 'folders'>('songs');
  const [hasSearched, setHasSearched] = useState(false);

  const {
    recentSearches,
    searchResults,
    isLoading,
    error,
    totalResults,
    currentPage,
    addRecentSearch,
    clearRecentSearches,
    setSearchResults,
    addSearchResults,
    setLoading,
    setError,
    reset,
    loadFromStorage,
  } = useSearchStore();

  const setQueue = usePlayerStore((state) => state.setQueue);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setHasSearched(false);
      reset();
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      let response;
      
      switch (searchType) {
        case 'songs':
          response = await searchService.searchSongs(query, page, 20);
          break;
        case 'artists':
          response = await searchService.searchArtists(query, page, 20);
          break;
        case 'albums':
          response = await searchService.searchAlbums(query, page, 20);
          break;
        default:
          response = await searchService.searchSongs(query, page, 20);
      }

      // Handle different response formats
      console.log('Search response:', JSON.stringify(response, null, 2));
      
      // Check for both response formats: status: 'SUCCESS' or success: true
      const isSuccess = response.status === 'SUCCESS' || 
                        response.status === 'success' || 
                        response.success === true;
      
      if (isSuccess) {
        // Handle both data structures:
        // Format 1: { status: 'SUCCESS', data: { results: [], total: 0 } }
        // Format 2: { success: true, data: { results: [], total: 0 } }
        const results = response.data?.results || [];
        const total = response.data?.total || 0;
        
        console.log(`Found ${results.length} results for query: "${query}"`);
        
        if (results.length > 0) {
          if (page === 1) {
            setSearchResults(results, total, page, query);
            addRecentSearch(query);
          } else {
            addSearchResults(results);
          }
        } else {
          console.log('No results found for query:', query);
          setError('No results found. Please try a different search.');
        }
      } else {
        console.error('Unexpected response format. Status:', response.status, 'Success:', response.success);
        console.error('Full response:', response);
        setError('Search failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to search. Please try again.';
      setError(errorMessage);
      
      // If no results, show empty state
      if (page === 1) {
        setSearchResults([], 0, 1, query);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    handleSearch(searchQuery, 1);
  };

  const handleSongPress = (song: Song) => {
    // Only handle songs that have download URLs
    if (!song.downloadUrl || song.downloadUrl.length === 0) {
      console.warn('Song has no download URLs:', song.name);
      return;
    }
    console.log('Song pressed:', song.name);
    console.log('Song download URLs:', song.downloadUrl);
    setQueue([song], 0);
    navigation.navigate('Player');
  };

  const handlePlayButtonPress = (song: Song, e: any) => {
    e.stopPropagation();
    // Only handle songs that have download URLs
    if (!song.downloadUrl || song.downloadUrl.length === 0) {
      console.warn('Song has no download URLs:', song.name);
      return;
    }
    console.log('Play button pressed for:', song.name);
    setQueue([song], 0);
    navigation.navigate('Player');
  };

  const handleArtistPress = (artistId: string, artistName: string) => {
    navigation.navigate('ArtistDetail', { artistId, artistName });
  };

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
    handleSearch(query, 1);
  };

  const loadMore = () => {
    if (!isLoading && searchResults.length < totalResults) {
      handleSearch(searchQuery, currentPage + 1);
    }
  };

  const removeRecentSearch = (index: number) => {
    const updated = recentSearches.filter((_, i) => i !== index);
    clearRecentSearches();
    updated.forEach((search) => addRecentSearch(search));
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSongPress(item)}
    >
      <Image
        source={{ uri: getImageUrl(item.image, '150x150') }}
        style={styles.resultThumbnail}
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {item.primaryArtists}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.playButton}
        onPress={(e) => handlePlayButtonPress(item, e)}
      >
        <Ionicons name="play-circle" size={32} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleArtistPress(item.id, item.name)}
    >
      <Image
        source={{ uri: getImageUrl(item.image, '150x150') }}
        style={styles.resultThumbnail}
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {item.role || 'Artist'}
        </Text>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => {
        // Navigate to album detail if we have album detail screen
        // For now, just show a message or navigate to song list
        console.log('Album pressed:', item.name);
      }}
    >
      <Image
        source={{ uri: getImageUrl(item.image, '150x150') }}
        style={styles.resultThumbnail}
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>
          {item.primaryArtists || item.artists || 'Album'}
        </Text>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => {
    switch (searchType) {
      case 'songs':
        return renderSongItem({ item });
      case 'artists':
        return renderArtistItem({ item });
      case 'albums':
        return renderAlbumItem({ item });
      default:
        return renderSongItem({ item });
    }
  };

  const renderRecentSearch = (item: string, index: number) => (
    <View key={index} style={styles.recentSearchItem}>
      <TouchableOpacity
        style={styles.recentSearchContent}
        onPress={() => handleRecentSearch(item)}
      >
        <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.recentSearchText}>{item}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => removeRecentSearch(index)}
        style={styles.removeButton}
      >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => {
    if (isLoading) return null;
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.primary} />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      );
    }

    if (hasSearched && searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>😞</Text>
          <Text style={styles.emptyTitle}>Not Found</Text>
          <Text style={styles.emptyText}>
            Sorry, the keyword you entered cannot be found. Please check again or search with another keyword.
          </Text>
        </View>
      );
    }

    if (!hasSearched && recentSearches.length > 0) {
      return (
        <View style={styles.recentSearchesContainer}>
          <View style={styles.recentSearchesHeader}>
            <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearRecentSearches}>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          </View>
          {recentSearches.map((search, index) => renderRecentSearch(search, index))}
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyText}>Search for songs, artists, or albums</Text>
      </View>
    );
  };

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setHasSearched(false);
              reset();
            }}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterTabs}>
          {(['songs', 'artists', 'albums', 'folders'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterTab,
                searchType === type && styles.filterTabActive,
              ]}
              onPress={() => {
                setSearchType(type);
                if (searchQuery) {
                  handleSearch(searchQuery, 1);
                }
              }}
            >
              <Text
                style={[
                  styles.filterTabText,
                  searchType === type && styles.filterTabTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading && searchResults.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && searchResults.length > 0 ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.footerLoader} />
            ) : null
          }
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
  searchContainer: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: colors.surface,
  },
  resultInfo: {
    flex: 1,
    marginRight: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  playButton: {
    padding: 8,
    marginRight: 8,
  },
  moreButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 400,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  recentSearchesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  clearAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentSearchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  recentSearchText: {
    fontSize: 16,
    color: colors.text,
  },
  removeButton: {
    padding: 4,
  },
  footerLoader: {
    marginVertical: 16,
  },
});

export default SearchScreen;
