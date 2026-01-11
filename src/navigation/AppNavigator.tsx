import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import QueueScreen from '../screens/QueueScreen';
import PlayerScreen from '../screens/PlayerScreen';
import SongListScreen from '../screens/SongListScreen';
import ArtistDetailScreen from '../screens/ArtistDetailScreen';
import AlbumDetailScreen from '../screens/AlbumDetailScreen';
import MiniPlayer from '../components/MiniPlayer';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';

export type RootStackParamList = {
  MainTabs: undefined;
  Search: undefined;
  Player: undefined;
  Queue: undefined;
  SongList: { title: string; songs: any[] };
  ArtistDetail: { artistId: string; artistName: string };
  AlbumDetail: { albumId: string; albumName: string };
};

export type TabParamList = {
  Home: undefined;
  Favorites: undefined;
  Playlists: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const colors = useThemeStore((state) => state.colors);
  
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Favorites') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Playlists') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} />
        <Tab.Screen name="Playlists" component={PlaylistsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
      <MiniPlayer />
    </>
  );
}

export default function AppNavigator() {
  const colors = useThemeStore((state) => state.colors);
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="Player" 
        component={PlayerScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="Queue" 
        component={QueueScreen}
        options={{
          headerShown: true,
          title: 'Queue',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <Stack.Screen 
        name="SongList" 
        component={SongListScreen}
        options={{
          headerShown: true,
          title: 'Songs',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <Stack.Screen 
        name="ArtistDetail" 
        component={ArtistDetailScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
      <Stack.Screen 
        name="AlbumDetail" 
        component={AlbumDetailScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />
    </Stack.Navigator>
  );
}
