import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getDeviceLanguage, LANGUAGES, localeFor } from './languages';
import { NAMESPACES, resources } from './resources';

/**
 * i18next setup. Imported once in index.js, before the app renders.
 *
 * - Texts live in src/i18n/locales/<language>/<namespace>.ts.
 * - Components read them with `const { t } = useTranslation('todo')` and
 *   re-render when the language changes.
 * - Code outside components uses `i18n.t('todo:key')`.
 * - The language starts as the device language; the one chosen in the
 *   drawer is saved in AsyncStorage (src/settings/settingsStore.ts).
 */
i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  supportedLngs: [...LANGUAGES],
  ns: NAMESPACES,
  defaultNS: 'common',
  // Resources are bundled, so init finishes synchronously.
  initAsync: false,
  interpolation: {
    // React already escapes text; HTML escaping would show "&amp;".
    escapeValue: false,
  },
  react: {
    // Everything is loaded up front: no Suspense needed.
    useSuspense: false,
  },
});

/** Locale for dates and numbers in the current language ("es-MX"). */
export function currentLocale() {
  return localeFor(i18n.language);
}

export default i18n;
