# Music Player App

A modern music streaming application built with React Native (Expo) and TypeScript, using the JioSaavn API for music content. Features a beautiful UI with light/dark theme support, comprehensive playlist management, and a seamless listening experience.

## Features

### Core Features (Required)

#### 1. **Home Screen**
- **Recently Played**: Displays recently played songs with album artwork
- **Top Artists**: Shows popular artists with circular avatars
- **Most Played**: Lists frequently played tracks
- **Tab Navigation**: Switch between Suggested, Songs, Artists, and Albums views
- **Infinite Scroll**: Automatically loads more content as you scroll
- **Quick Access**: "See all" buttons for expanded views

#### 2. **Search Functionality**
- **Multi-type Search**: Search across Songs, Artists, Albums, and Folders
- **Real-time Results**: Instant search with pagination support
- **Filter Tabs**: Easy switching between search types
- **Recent Searches**: Persistent search history with quick access
- **Empty States**: Helpful messages when no results found
- **Pagination**: Automatically loads more results on scroll

#### 3. **Full Music Player**
- **Large Album Art**: High-resolution album artwork display
- **Seek Bar**: Drag to seek through the song with visual progress
- **Playback Controls**:
  - Play/Pause button
  - Previous/Next song buttons
  - 10-second rewind/fast-forward buttons
  - Time display (current/total duration)
- **Secondary Controls**:
  - Shuffle mode toggle
  - Repeat mode (None/All/One)
  - Queue access
  - Add to Favorites
  - Add to Playlist
- **Song Details**: Access song information via menu
- **Song Info**: Displays song title, artist, and album

#### 4. **Mini Player**
- **Persistent Display**: Always visible at the bottom of the screen
- **Real-time Sync**: Synchronized with full player state
- **Quick Access**: Tap to open full player
- **Progress Bar**: Visual indicator of playback progress
- **Play/Pause**: Quick control without opening full player
- **Song Info**: Displays thumbnail, title, and artist name

#### 5. **Queue Management**
- **Queue Display**: View all songs in the playback queue
- **Add to Queue**: Add songs from anywhere in the app
- **Remove Songs**: Remove unwanted songs with confirmation
- **Reorder Songs**: Move songs up or down in the queue
- **Current Song Indicator**: Highlights the currently playing song
- **Persistent Queue**: Queue persists across app restarts
- **Auto-play**: Automatically starts playing when queue is set

#### 6. **Background Playback**
- **Continuous Playback**: Music continues when app is minimized
- **Lock Screen Support**: Plays when device screen is locked
- **Background Audio**: Configured for iOS and Android
- **Wake Lock**: Prevents device from sleeping during playback
- **Foreground Service**: Android service for background playback

### Bonus Features 

#### 7. **Shuffle Mode**
- **Random Playback**: Shuffle songs in the queue randomly
- **Visual Indicator**: Active state shown in player controls
- **Toggle Control**: Easy on/off switching

#### 8. **Repeat Modes**
- **Three Modes**:
  - **None**: Play queue once and stop
  - **All**: Repeat entire queue
  - **One**: Repeat current song only
- **Visual Feedback**: Different icons for each mode
- **Indicator**: Shows "1" when single song repeat is active

#### 9. **Offline Storage**
- **Queue Persistence**: Queue saved locally and restored on app start
- **Recent Searches**: Search history persisted across sessions
- **Theme Preference**: Light/dark theme choice remembered
- **Playlists**: User-created playlists saved locally
- **Favorites**: Favorite songs list persisted

### Additional Features (Beyond Requirements)

#### 10. **Light/Dark Theme**
- **Theme Toggle**: Switch between light and dark modes
- **Persistent Preference**: Theme choice saved and restored
- **Dynamic Colors**: All UI elements adapt to theme
- **Settings Integration**: Accessible from Settings screen

#### 11. **Playlists Management**
- **Create Playlists**: Create custom playlists with custom names
- **Add Songs**: Add songs to playlists from player or song menus
- **View Playlists**: Browse all created playlists
- **Remove Songs**: Remove songs from playlists
- **Playlist Details**: View all songs in a playlist
- **Play All**: Play entire playlist from playlist view

#### 12. **Favorites System**
- **Add to Favorites**: Mark songs as favorites with one tap
- **Favorites Screen**: View all favorite songs
- **Remove from Favorites**: Unfavorite songs easily
- **Visual Indicator**: Heart icon shows favorite status
- **Persistent Storage**: Favorites saved locally

#### 13. **Artist & Album Details**
- **Artist Profiles**: View artist information with large image
- **Artist Songs**: Browse all songs by an artist (with pagination)
- **Artist Albums**: See all albums by an artist
- **Album Details**: View album information and tracks
- **Play All**: Play all songs from artist/album
- **Shuffle Play**: Shuffle all songs from artist/album

#### 14. **Enhanced Navigation**
- **Bottom Tab Navigator**: Home, Favorites, Playlists, Settings
- **Stack Navigation**: Deep linking for player, queue, and detail screens
- **Smooth Transitions**: Native animations for screen transitions
- **Back Navigation**: Proper back button handling

#### 15. **Advanced Pagination**
- **Infinite Scroll**: Auto-load more content in Home screen
- **Load More Button**: Manual load more in Artist detail screen
- **Progress Indicators**: Loading states while fetching data
- **Efficient Loading**: Loads 100 items per page for better performance

#### 16. **Settings Screen**
- **Theme Toggle**: Switch between light and dark themes
- **App Information**: Version and app details
- **Future Settings**: Placeholder for additional preferences

##  Tech Stack

- **Framework**: React Native with Expo (~50.0.0)
- **Language**: TypeScript
- **Navigation**: React Navigation v6
  - Native Stack Navigator
  - Bottom Tab Navigator
- **State Management**: Zustand (4 stores)
  - Player Store
  - Search Store
  - Theme Store
  - Playlist Store
  - Favorites Store
- **Storage**: AsyncStorage (for persistence)
- **Audio Playback**: expo-av (~14.0.0)
  - Background playback support
  - Position tracking
  - Quality selection (auto-selects best available)
- **HTTP Client**: Axios
- **UI Icons**: @expo/vector-icons
- **Safe Areas**: react-native-safe-area-context

## Project Structure

```
Music_player/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── MiniPlayer.tsx       # Persistent mini player
│   │   └── CustomSlider.tsx     # Custom seek bar component
│   ├── constants/               # App constants
│   │   └── colors.ts            # Theme color definitions
│   ├── hooks/                   # Custom React hooks
│   │   └── useTheme.ts          # Theme hook
│   ├── navigation/              # Navigation configuration
│   │   └── AppNavigator.tsx     # Main navigation setup
│   ├── screens/                 # Screen components
│   │   ├── HomeScreen.tsx       # Home with categories
│   │   ├── SearchScreen.tsx     # Search functionality
│   │   ├── PlayerScreen.tsx     # Full music player
│   │   ├── QueueScreen.tsx      # Queue management
│   │   ├── FavoritesScreen.tsx  # Favorite songs
│   │   ├── PlaylistsScreen.tsx  # Playlist management
│   │   ├── SettingsScreen.tsx   # App settings
│   │   ├── SongListScreen.tsx   # Song list view
│   │   ├── ArtistDetailScreen.tsx # Artist details
│   │   └── AlbumDetailScreen.tsx  # Album details
│   ├── services/                # Business logic
│   │   ├── api.ts               # JioSaavn API service
│   │   └── audioPlayer.ts       # Audio playback service
│   ├── stores/                  # Zustand stores
│   │   ├── playerStore.ts       # Player state
│   │   ├── searchStore.ts       # Search state
│   │   ├── themeStore.ts        # Theme state
│   │   ├── playlistStore.ts     # Playlist state
│   │   └── favoritesStore.ts    # Favorites state
│   ├── types/                   # TypeScript definitions
│   │   └── index.ts             # Type interfaces
│   └── utils/                   # Utility functions
│       ├── formatTime.ts        # Time formatting
│       └── getImageUrl.ts       # Image URL helper
├── assets/                      # App assets
│   ├── icon.png                 # App icon
│   ├── splash.png               # Splash screen
│   ├── adaptive-icon.png        # Android adaptive icon
│   └── favicon.png              # Web favicon
├── App.tsx                      # Root component
├── app.json                     # Expo configuration
├── babel.config.js              # Babel configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
├── README.md                    # Currently opened file
└── QUICK_START.md               # Quick start guide
```

##  Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo Go app (for testing on physical device)
- iOS Simulator (Mac) or Android Studio (for emulator testing)

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd Music_player
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   # or with clear cache
   expo start --clear
   ```

4. **Run on your device**
   - **Physical Device (Recommended)**: 
     - Install "Expo Go" from App Store/Play Store
     - Scan QR code shown in terminal
   - **iOS Simulator (Mac)**: Press `i` in terminal
   - **Android Emulator**: Press `a` in terminal
   - **Web Browser**: Press `w` in terminal (limited audio support)

For detailed setup instructions, see [QUICK_START.md](./QUICK_START.md).

##  Architecture

### State Management (Zustand)

The app uses **Zustand** for state management with 5 main stores:

1. **Player Store** (`playerStore.ts`)
   - Manages playback state (current song, position, duration, playing status)
   - Handles queue operations (add, remove, reorder, set)
   - Implements shuffle and repeat modes
   - Persists queue and settings to AsyncStorage

2. **Search Store** (`searchStore.ts`)
   - Manages search results and pagination
   - Stores recent searches
   - Handles search state (loading, error, query, page)

3. **Theme Store** (`themeStore.ts`)
   - Manages light/dark theme mode
   - Provides theme colors based on current mode
   - Persists theme preference to AsyncStorage

4. **Playlist Store** (`playlistStore.ts`)
   - Manages user-created playlists
   - Handles playlist operations (create, delete, add song, remove song)
   - Persists playlists to AsyncStorage

5. **Favorites Store** (`favoritesStore.ts`)
   - Manages favorite songs list
   - Handles add/remove favorite operations
   - Persists favorites to AsyncStorage

### Audio Playback Service

The `audioPlayer` service handles all audio operations:
- **Background Playback**: Configured using `expo-av` with background audio mode
- **Position Tracking**: Updates every 500ms when playing
- **Auto-play Next**: Automatically plays next song when current finishes
- **Quality Selection**: Automatically selects best available audio quality (prefers 320kbps → 160kbps → 96kbps → 48kbps)
- **Error Handling**: Graceful handling of playback errors

### Navigation Structure

```
App Navigator (Stack)
├── MainTabs (Bottom Tabs)
│   ├── Home
│   ├── Favorites
│   ├── Playlists
│   └── Settings
├── Search (Modal)
├── Player (Full Screen)
├── Queue (Modal)
├── SongList
├── ArtistDetail
└── AlbumDetail
```

### API Integration

The app integrates with the JioSaavn API:
- **Base URL**: `https://saavn.sumit.co/`
- **No API Key Required**: Public API endpoints
- **Endpoints Used**:
  - `/api/search/songs` - Search songs with pagination
  - `/api/search/artists` - Search artists with pagination
  - `/api/search/albums` - Search albums with pagination
  - `/api/songs/{id}` - Get song details
  - `/api/songs/{id}/suggestions` - Get song suggestions
  - `/api/artists/{id}` - Get artist details
  - `/api/artists/{id}/songs` - Get artist's songs (with pagination)
  - `/api/artists/{id}/albums` - Get artist's albums

##  Key Features Implementation

### Background Playback
- Configured in `app.json` with `UIBackgroundModes: ["audio"]` for iOS
- Android permissions for `FOREGROUND_SERVICE` and `WAKE_LOCK`
- Audio mode set to `staysActiveInBackground: true` in `audioPlayer.ts`
- Proper audio session configuration for uninterrupted playback

### State Synchronization
- Mini Player and Full Player share the same Zustand store
- Position updates are reactive - both components update automatically
- Store subscriptions ensure UI stays perfectly in sync
- No manual state prop drilling required

### Queue Persistence
- Queue is saved to AsyncStorage whenever it changes
- Loaded automatically on app start
- Survives app restarts and device reboots
- Includes current position and playing status

### Pagination
- **Home Screen**: Infinite scroll loads 100 songs/artists per page
- **Search Screen**: Load more on scroll with pagination
- **Artist Detail**: "Load More" button to fetch all songs (100 per page)
- Progress indicators shown during loading

### Theme System
- Light and dark themes with complete color schemes
- Theme toggle in Settings screen
- Preference persisted to AsyncStorage
- All screens and components are theme-aware

##  Design Decisions & Trade-offs

### 1. Zustand over Redux Toolkit
- **Decision**: Used Zustand for simpler API and less boilerplate
- **Trade-off**: Less ecosystem tools, but sufficient for this app size
- **Benefit**: Easier to learn and maintain, faster development

### 2. AsyncStorage over MMKV
- **Decision**: Used AsyncStorage for better Expo compatibility
- **Trade-off**: Slightly slower than MMKV, but works seamlessly with Expo Go
- **Benefit**: No native module compilation needed

### 3. Manual Queue Reordering
- **Decision**: Used up/down buttons instead of drag-and-drop
- **Trade-off**: Less intuitive UX, but more compatible across platforms
- **Benefit**: Works consistently on all devices and screen sizes

### 4. Infinite Scroll Pagination
- **Decision**: Load more on scroll instead of numbered pages
- **Trade-off**: Can't jump to specific pages, but better UX for mobile
- **Benefit**: More natural mobile interaction pattern

### 5. Auto Quality Selection
- **Decision**: Automatically selects best available quality
- **Trade-off**: No user control over quality, but ensures best experience
- **Benefit**: Simpler UX, always plays best available quality

### 6. Real API Integration
- **Decision**: All data comes from real API calls
- **Trade-off**: Requires internet connection, but meets requirements
- **Benefit**: Real-world data, proper error handling

##  Building for Production

### Android APK
```bash
# Install EAS CLI (if not installed)
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build -p android --profile preview

# Or build locally (requires Android Studio)
npm run android
```

### iOS
```bash
# Build iOS app
eas build -p ios --profile preview
```

##  Known Limitations

1. **Offline Downloads**: Download functionality is not fully implemented (bonus feature)
2. **Lyrics Display**: API provides `hasLyrics` flag but not actual lyrics data
3. **Queue Drag & Drop**: Simplified to up/down buttons for better compatibility
4. **Audio Quality Control**: Automatically selects best quality (no manual control)
5. **Album Details**: Album detail endpoint is limited, uses search as fallback

##  Future Enhancements

- Full offline download functionality
- Lyrics display when available
- Equalizer and audio effects
- Sleep timer
- Widget support for home screen
- Social features (share playlists, songs)
- Playlist sharing via links
- Audio waveform visualization
- Cross-device sync
- Podcast support

##  Troubleshooting

### Audio not playing in background
- Ensure `UIBackgroundModes` is configured in `app.json`
- Check Android permissions in `app.json`
- Verify audio mode is set correctly in `audioPlayer.ts`
- Test on physical device (emulators may have limitations)

### Build errors
- Clear cache: `expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version (requires v16+)

### Metro bundler errors
- Stop Metro bundler (Ctrl+C)
- Clear cache: `expo start --clear`
- Restart: `npm start`

### Navigation issues
- Ensure React Navigation dependencies are properly installed
- Check that navigation structure matches type definitions
- Verify all screens are properly registered

### API errors
- Check internet connection
- Verify API base URL is correct
- Check API response format matches expected structure


##  Author

Developed with React Native, Expo, and TypeScript following best practices for mobile app development.

---

For detailed testing instructions, see [QUICK_START.md](./QUICK_START.md).