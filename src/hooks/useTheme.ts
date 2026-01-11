import { useThemeStore } from '../stores/themeStore';

export const useTheme = () => {
  const colors = useThemeStore((state) => state.colors);
  const theme = useThemeStore((state) => state.theme);
  return { colors, theme, isDark: theme === 'dark' };
};
