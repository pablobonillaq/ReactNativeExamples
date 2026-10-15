import {
  StyleSheet,
  useColorScheme,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSettings } from '../settings/settingsStore';
import { darkColors, lightColors, type ThemeColors } from './colors';

export type { ThemeColors } from './colors';

export type ColorScheme = 'light' | 'dark';

/**
 * Shape accepted by makeStyles: each key is a View, Text or Image style.
 * (React Native 0.87 no longer exports StyleSheet.NamedStyles.) Using it as
 * the generic constraint keeps literals like 'row' or '700' narrow.
 */
export type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

export type Theme = {
  scheme: ColorScheme;
  isDark: boolean;
  colors: ThemeColors;
};

// Two constant objects: their identity only changes when the scheme does,
// which keeps makeStyles' cache and memoized components effective.
export const LIGHT_THEME: Theme = {
  scheme: 'light',
  isDark: false,
  colors: lightColors,
};
export const DARK_THEME: Theme = {
  scheme: 'dark',
  isDark: true,
  colors: darkColors,
};

/**
 * The theme in use: the one chosen in the drawer, or the device's when the
 * choice is "System" (it updates live when the phone switches modes).
 *
 *   const { colors, isDark } = useTheme();
 */
export function useTheme(): Theme {
  const { themePreference } = useSettings();
  const deviceScheme = useColorScheme();
  const scheme: ColorScheme =
    themePreference === 'system'
      ? deviceScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;
  return scheme === 'dark' ? DARK_THEME : LIGHT_THEME;
}

/**
 * Themed StyleSheet. Declare it at module level and call the returned hook
 * inside components:
 *
 *   const useStyles = makeStyles(c => ({
 *     container: { flex: 1, backgroundColor: c.background },
 *     title: { color: c.text },
 *   }));
 *
 *   function Screen() {
 *     const styles = useStyles();
 *     ...
 *   }
 *
 * Each theme's StyleSheet is created once and cached.
 */
export function makeStyles<T extends NamedStyles<T>>(
  factory: (colors: ThemeColors, theme: Theme) => T,
) {
  const cache = new Map<Theme, T>();
  return function useStyles(): T {
    const theme = useTheme();
    const cached = cache.get(theme);
    if (cached) {
      return cached;
    }
    const styles = StyleSheet.create(factory(theme.colors, theme)) as T;
    cache.set(theme, styles);
    return styles;
  };
}
