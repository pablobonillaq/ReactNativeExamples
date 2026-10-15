import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import i18n from '../src/i18n';
import type { RootStackScreenProps } from '../src/navigation/types';
import { HomeScreen } from '../src/screens/HomeScreen';
import {
  getSettings,
  loadSettings,
  resetSettingsForTests,
  setLanguage,
  setThemePreference,
  STORAGE_KEYS,
} from '../src/settings/settingsStore';
import { DARK_THEME, LIGHT_THEME, useTheme, type Theme } from '../src/theme';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Trees mounted by each test; unmounted afterwards so later store/i18n
// changes don't re-render them outside act().
const mounted: ReactTestRenderer[] = [];

function mount(element: ReactElement) {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = create(element);
  });
  mounted.push(tree);
  return tree;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  await i18n.changeLanguage('en');
  resetSettingsForTests();
});

afterEach(() => {
  act(() => {
    mounted.splice(0).forEach(tree => tree.unmount());
  });
});

afterAll(async () => {
  await i18n.changeLanguage('en');
});

function renderHome() {
  // HomeScreen only uses navigation.navigate.
  const props = {
    navigation: { navigate: jest.fn() },
    route: {},
  } as unknown as RootStackScreenProps<'Home'>;
  return mount(<HomeScreen {...props} />);
}

test('setLanguage changes i18next, re-renders and saves the choice', async () => {
  const tree = renderHome();
  expect(JSON.stringify(tree.toJSON())).toContain('Todo list (Context API)');

  await act(() => setLanguage('es'));

  expect(i18n.language).toBe('es');
  expect(getSettings().language).toBe('es');
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Lista de tareas (Context API)',
  );
  expect(await AsyncStorage.getItem(STORAGE_KEYS.language)).toBe('es');
});

test('the theme preference is saved and drives useTheme()', async () => {
  const seen: { theme: Theme | null } = { theme: null };
  function Probe() {
    seen.theme = useTheme();
    return null;
  }
  mount(<Probe />);

  await act(() => setThemePreference('dark'));
  expect(seen.theme).toBe(DARK_THEME);
  expect(await AsyncStorage.getItem(STORAGE_KEYS.theme)).toBe('dark');

  await act(() => setThemePreference('light'));
  expect(seen.theme).toBe(LIGHT_THEME);
});

test('loadSettings restores the saved language and theme', async () => {
  await AsyncStorage.setItem(STORAGE_KEYS.language, 'es');
  await AsyncStorage.setItem(STORAGE_KEYS.theme, 'dark');
  resetSettingsForTests({ loaded: false });

  await act(() => loadSettings());

  expect(getSettings()).toEqual({
    language: 'es',
    themePreference: 'dark',
    loaded: true,
  });
  expect(i18n.t('settings:title')).toBe('Ajustes');
});

test('invalid saved values fall back to the defaults', async () => {
  await AsyncStorage.setItem(STORAGE_KEYS.language, 'fr');
  await AsyncStorage.setItem(STORAGE_KEYS.theme, 'sepia');
  resetSettingsForTests({ loaded: false });

  await act(() => loadSettings());

  expect(getSettings().language).toBe('en');
  expect(getSettings().themePreference).toBe('system');
});
