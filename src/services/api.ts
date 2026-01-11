import axios from 'axios';
import { SearchResponse, SongDetailResponse, Song } from '../types';

const BASE_URL = 'https://saavn.sumit.co';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const searchService = {
  search: async (query: string): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>('/api/search', {
      params: { query },
    });
    return response.data;
  },

  searchSongs: async (query: string, page: number = 1, limit: number = 20): Promise<SearchResponse> => {
    try {
      const response = await api.get<SearchResponse>('/api/search/songs', {
        params: { query, page, limit },
      });
      console.log('Search Songs Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Search Songs Error:', error.response?.data || error.message);
      throw error;
    }
  },

  searchAlbums: async (query: string, page: number = 1, limit: number = 20): Promise<SearchResponse> => {
    try {
      const response = await api.get<SearchResponse>('/api/search/albums', {
        params: { query, page, limit },
      });
      console.log('Search Albums Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Search Albums Error:', error.response?.data || error.message);
      throw error;
    }
  },

  searchArtists: async (query: string, page: number = 1, limit: number = 20): Promise<SearchResponse> => {
    try {
      const response = await api.get<SearchResponse>('/api/search/artists', {
        params: { query, page, limit },
      });
      console.log('Search Artists Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Search Artists Error:', error.response?.data || error.message);
      throw error;
    }
  },

  searchPlaylists: async (query: string, page: number = 1, limit: number = 20): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>('/api/search/playlists', {
      params: { query, page, limit },
    });
    return response.data;
  },
};

export const songService = {
  getSong: async (id: string): Promise<Song> => {
    const response = await api.get<SongDetailResponse>(`/api/songs/${id}`);
    if (response.data.success && response.data.data.length > 0) {
      return response.data.data[0];
    }
    throw new Error('Song not found');
  },

  getSuggestions: async (id: string): Promise<Song[]> => {
    const response = await api.get<SongDetailResponse>(`/api/songs/${id}/suggestions`);
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  },
};

export const artistService = {
  getArtist: async (id: string): Promise<any> => {
    const response = await api.get(`/api/artists/${id}`);
    return response.data;
  },

  getArtistSongs: async (id: string, page: number = 1, limit: number = 20): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>(`/api/artists/${id}/songs`, {
      params: { page, limit },
    });
    return response.data;
  },

  getArtistAlbums: async (id: string, page: number = 1, limit: number = 20): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>(`/api/artists/${id}/albums`, {
      params: { page, limit },
    });
    return response.data;
  },
};
