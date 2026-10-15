import type { RootStackParamList } from './types';

/** Routes that appear in the main menu (Home is the menu itself). */
export type ExampleRoute = Exclude<
  keyof RootStackParamList,
  'Home' | 'NavDetail' | 'BreakingBadCharacter'
>;

/**
 * Main menu items, in order. Titles and descriptions are translated:
 * src/i18n/locales/<language>/navigation.ts → menu.<route>.
 *
 * To add a new example:
 * 1. Create the screen in src/screens/<topic>/
 * 2. Add the route to RootStackParamList (types.ts)
 * 3. Register the screen in App.tsx
 * 4. Add the route here
 * 5. Add its title (screens.<route>) and menu entry (menu.<route>) to the
 *    navigation translations, in English and Spanish
 */
export const EXAMPLES: ExampleRoute[] = [
  'Lists',
  'Pokemon',
  'PokemonInfinite',
  'PersonForm',
  'PersonFormRHF',
  'NavigationDemo',
  'DeepLinkDemo',
  'BreakingBad',
  'Todo',
  'TodoRedux',
  'TodoZustand',
  'TodoMobx',
  'TodoStorage',
  'TodoSqlite',
  'TodoNative',
  'PhotoGallery',
  'Accessibility',
  'Vault',
  'BusesMap',
  'Share',
  'AnimatedApi',
  'Reanimated',
  'Flipper',
  'Hermes',
  'Rerenders',
  'Bridging',
  'SentryDebug',
];
