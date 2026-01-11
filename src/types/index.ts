export interface Image {
  quality: string;
  link?: string;
  url?: string;
}

export interface DownloadUrl {
  quality: string;
  link?: string;
  url?: string;
}

export interface Album {
  id: string;
  name: string;
  url?: string;
}

export interface Artist {
  id: string;
  name: string;
}

export interface Song {
  id: string;
  name: string;
  type?: string;
  album: Album;
  year?: string;
  releaseDate?: string | null;
  duration: string | number;
  label?: string;
  primaryArtists: string;
  primaryArtistsId: string;
  featuredArtists?: string;
  featuredArtistsId?: string;
  explicitContent?: number;
  playCount?: string;
  language?: string;
  hasLyrics?: string | boolean;
  url?: string;
  copyright?: string;
  image: Image[];
  downloadUrl: DownloadUrl[];
  artists?: {
    primary: Artist[];
  };
}

export interface SearchResponse {
  status?: string;
  success?: boolean;
  data: {
    results: Song[];
    total: number;
    start: number;
  };
}

export interface SongDetailResponse {
  success: boolean;
  data: Song[];
}

export interface ArtistDetail {
  id: string;
  name: string;
  image?: Image[];
  followerCount?: string;
  fanCount?: string;
  isVerified?: boolean;
  dominantLanguage?: string;
  dominantType?: string;
  bio?: Array<{ text: string }>;
  dob?: string;
  fb?: string;
  twitter?: string;
  wiki?: string;
  urls?: {
    albums?: string;
    bio?: string;
    comments?: string;
    songs?: string;
  };
}

export interface QueueItem {
  song: Song;
  index: number;
}

export type RepeatMode = 'none' | 'one' | 'all';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: Song[];
  currentIndex: number;
  isLoading: boolean;
}
