import axios, { AxiosError, AxiosResponse } from 'axios';
import { SearchResponse, SongDetailResponse, Song } from '../types';

// Allow overriding the Saavn proxy via env so we can switch quickly if a proxy rate-limits.
// You can set multiple comma-separated URLs in EXPO_PUBLIC_API_BASE_URLS to enable automatic failover.
// Example: EXPO_PUBLIC_API_BASE_URLS=https://saavn.sumit.co,https://your-backup-proxy.example.com
const baseUrlEnv =
  process.env.EXPO_PUBLIC_API_BASE_URLS ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://saavn.sumit.co';

const BASE_URLS = baseUrlEnv.split(',').map((u) => u.trim()).filter(Boolean);
let currentBaseIndex = 0;

const api = axios.create({
  baseURL: BASE_URLS[currentBaseIndex],
  timeout: 10000,
});

// Helper to detect Cloudflare/429 rate limit HTML responses
const isRateLimited = (response?: AxiosResponse, data?: any) => {
  if (response?.status === 429) return true;
  if (typeof data === 'string' && data.includes('rate limited')) return true;
  return false;
};

// Map common backend errors (e.g., Cloudflare 429) to clearer messages and try failover once.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const data = error.response?.data;
    const status = error.response?.status;
    const config: any = error.config || {};

    const rateLimited = isRateLimited(error.response, data);
    const canFailover = BASE_URLS.length > 1 && !config.__retryWithNextBase && rateLimited;

    if (canFailover) {
      // switch to next base URL and retry once
      currentBaseIndex = (currentBaseIndex + 1) % BASE_URLS.length;
      const nextBase = BASE_URLS[currentBaseIndex];
      api.defaults.baseURL = nextBase;
      config.baseURL = nextBase;
      config.__retryWithNextBase = true;
      console.warn(`Saavn API rate-limited; switching to backup base URL: ${nextBase}`);
      return api.request(config);
    }

    if (rateLimited) {
      return Promise.reject(new Error('Rate limited by the Saavn API. Please wait a minute or switch the API base URL.'));
    }

    return Promise.reject(error);
  }
);

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
