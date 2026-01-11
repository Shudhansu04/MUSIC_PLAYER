import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';

const SettingsScreen: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const colors = useThemeStore((state) => state.colors);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const loadTheme = useThemeStore((state) => state.loadTheme);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.background }]}
            onPress={toggleTheme}
          >
            <View style={styles.settingLeft}>
              <Ionicons 
                name={theme === 'dark' ? 'moon' : 'sunny'} 
                size={20} 
                color={colors.primary} 
                style={styles.settingIcon}
              />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {theme === 'dark' ? 'Dark' : 'Light'}
              </Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={theme === 'dark' ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Audio</Text>
          <View style={[styles.settingItem, { backgroundColor: colors.background }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Audio Quality</Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>High (320kbps)</Text>
          </View>
        </View>

        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
          <View style={[styles.settingItem, { backgroundColor: colors.background }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Version</Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingValue: {
    fontSize: 16,
  },
});

export default SettingsScreen;
