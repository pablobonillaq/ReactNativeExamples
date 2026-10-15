import enCommon from './locales/en/common';
import enNavigation from './locales/en/navigation';
import enSettings from './locales/en/settings';
import enHome from './locales/en/home';
import enErrors from './locales/en/errors';
import enForms from './locales/en/forms';
import enTodo from './locales/en/todo';
import enDebug from './locales/en/debug';
import enDeepLink from './locales/en/deepLink';
import enAccessibility from './locales/en/accessibility';
import enAnimated from './locales/en/animated';
import enReanimated from './locales/en/reanimated';
import enFlipper from './locales/en/flipper';
import enHermes from './locales/en/hermes';
import enRerenders from './locales/en/rerenders';
import enBridging from './locales/en/bridging';
import enLists from './locales/en/lists';
import enPokemon from './locales/en/pokemon';
import enBreakingBad from './locales/en/breakingBad';
import enNavigationDemo from './locales/en/navigationDemo';
import enPhotos from './locales/en/photos';
import enVault from './locales/en/vault';
import enBuses from './locales/en/buses';
import enShare from './locales/en/share';
import esCommon from './locales/es/common';
import esNavigation from './locales/es/navigation';
import esSettings from './locales/es/settings';
import esHome from './locales/es/home';
import esErrors from './locales/es/errors';
import esForms from './locales/es/forms';
import esTodo from './locales/es/todo';
import esDebug from './locales/es/debug';
import esDeepLink from './locales/es/deepLink';
import esAccessibility from './locales/es/accessibility';
import esAnimated from './locales/es/animated';
import esReanimated from './locales/es/reanimated';
import esFlipper from './locales/es/flipper';
import esHermes from './locales/es/hermes';
import esRerenders from './locales/es/rerenders';
import esBridging from './locales/es/bridging';
import esLists from './locales/es/lists';
import esPokemon from './locales/es/pokemon';
import esBreakingBad from './locales/es/breakingBad';
import esNavigationDemo from './locales/es/navigationDemo';
import esPhotos from './locales/es/photos';
import esVault from './locales/es/vault';
import esBuses from './locales/es/buses';
import esShare from './locales/es/share';

/**
 * Every translation, by language and namespace. A namespace groups the texts
 * of one feature (e.g. 'todo', 'animated') and lives in
 * locales/<language>/<namespace>.ts.
 */
export const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    settings: enSettings,
    home: enHome,
    errors: enErrors,
    forms: enForms,
    todo: enTodo,
    debug: enDebug,
    deepLink: enDeepLink,
    accessibility: enAccessibility,
    animated: enAnimated,
    reanimated: enReanimated,
    flipper: enFlipper,
    hermes: enHermes,
    rerenders: enRerenders,
    bridging: enBridging,
    lists: enLists,
    pokemon: enPokemon,
    breakingBad: enBreakingBad,
    navigationDemo: enNavigationDemo,
    photos: enPhotos,
    vault: enVault,
    buses: enBuses,
    share: enShare,
  },
  es: {
    common: esCommon,
    navigation: esNavigation,
    settings: esSettings,
    home: esHome,
    errors: esErrors,
    forms: esForms,
    todo: esTodo,
    debug: esDebug,
    deepLink: esDeepLink,
    accessibility: esAccessibility,
    animated: esAnimated,
    reanimated: esReanimated,
    flipper: esFlipper,
    hermes: esHermes,
    rerenders: esRerenders,
    bridging: esBridging,
    lists: esLists,
    pokemon: esPokemon,
    breakingBad: esBreakingBad,
    navigationDemo: esNavigationDemo,
    photos: esPhotos,
    vault: esVault,
    buses: esBuses,
    share: esShare,
  },
};

export const NAMESPACES = Object.keys(
  resources.en,
) as (keyof typeof resources.en)[];
export type Namespace = (typeof NAMESPACES)[number];
