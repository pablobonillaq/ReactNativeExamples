import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';
import i18n from '../i18n';
import { isLanguage, type Language } from '../i18n/languages';
import { setCrashlyticsAttribute, trackEvent } from '../observability/firebase';
import { createLogger } from '../observability/logger';

/**
 * User settings chosen in the drawer: language and theme. Saved in
 * AsyncStorage so they survive closing the app.
 *
 * A tiny external store (no Provider needed): components read it with
 * useSettings(); code outside React with getSettings().
 */

export type ThemePreference = 'system' | 'light' | 'dark';
export const THEME_PREFERENCES: ThemePreference[] = ['system', 'light', 'dark'];

export type Settings = {
  language: Language;
  themePreference: ThemePreference;
  /** true once the saved settings were read (or there were none). */
  loaded: boolean;
};

export const STORAGE_KEYS = {
  language: '@settings/language',
  theme: '@settings/theme',
};

const log = createLogger('Settings');

let state: Settings = {
  language: isLanguage(i18n.language) ? i18n.language : 'en',
  themePreference: 'system',
  loaded: false,
};
const listeners = new Set<() => void>();

function setState(changes: Partial<Settings>) {
  state = { ...state, ...changes };
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSettings() {
  return state;
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettings);
}

function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference);
}

/**
 * Makes native UI (date pickers, alerts, keyboard) follow a forced theme.
 * 'unspecified' goes back to the device setting.
 */
function applyNativeColorScheme(preference: ThemePreference) {
  try {
    const setColorScheme = Appearance.setColorScheme as unknown as (
      scheme: string,
    ) => void;
    setColorScheme(preference === 'system' ? 'unspecified' : preference);
  } catch (error) {
    log.warn('Could not apply the native color scheme', { preference }, error);
  }
}

/** Reads the saved settings. Called once at startup, before rendering. */
export async function loadSettings() {
  try {
    const [language, theme] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.language),
      AsyncStorage.getItem(STORAGE_KEYS.theme),
    ]);
    if (isLanguage(language) && language !== i18n.language) {
      await i18n.changeLanguage(language);
    }
    const themePreference = isThemePreference(theme) ? theme : 'system';
    if (themePreference !== 'system') {
      applyNativeColorScheme(themePreference);
    }
    setState({
      language: isLanguage(i18n.language) ? i18n.language : 'en',
      themePreference,
      loaded: true,
    });
    setCrashlyticsAttribute('language', state.language);
    setCrashlyticsAttribute('theme', themePreference);
    log.info('Settings loaded', {
      language: state.language,
      theme: themePreference,
      savedLanguage: language ?? 'none (device language)',
    });
  } catch (error) {
    // Defaults are fine: the app must start anyway.
    setState({ loaded: true });
    log.warn('Could not read saved settings', {}, error);
  }
}

export async function setLanguage(language: Language) {
  if (language === state.language) {
    return;
  }
  await i18n.changeLanguage(language);
  setState({ language });
  setCrashlyticsAttribute('language', language);
  trackEvent('settings_changed', { setting: 'language', value: language });
  log.info('Language changed', { language });
  await AsyncStorage.setItem(STORAGE_KEYS.language, language).catch(error =>
    log.warn('Could not save the language', { language }, error),
  );
}

export async function setThemePreference(themePreference: ThemePreference) {
  if (themePreference === state.themePreference) {
    return;
  }
  applyNativeColorScheme(themePreference);
  setState({ themePreference });
  setCrashlyticsAttribute('theme', themePreference);
  trackEvent('settings_changed', { setting: 'theme', value: themePreference });
  log.info('Theme changed', { theme: themePreference });
  await AsyncStorage.setItem(STORAGE_KEYS.theme, themePreference).catch(error =>
    log.warn('Could not save the theme', { themePreference }, error),
  );
}

/** Test helper: back to defaults without touching AsyncStorage. */
export function resetSettingsForTests(changes: Partial<Settings> = {}) {
  state = {
    language: 'en',
    themePreference: 'system',
    loaded: true,
    ...changes,
  };
  listeners.forEach(listener => listener());
}
