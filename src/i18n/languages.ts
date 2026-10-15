/** Languages the app is translated to. English is the fallback. */
export const LANGUAGES = ['en', 'es'] as const;
export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.includes(value as Language);
}

/**
 * Language of the device ("es-MX" → "es"). Used until the user picks one in
 * the drawer. Hermes implements Intl, so this reads the phone's locale.
 */
export function getDeviceLanguage(): Language {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.toLowerCase().startsWith('es') ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

/** Locale for dates and numbers (toLocaleDateString, Intl.NumberFormat…). */
export function localeFor(language: string): string {
  return language === 'es' ? 'es-MX' : 'en-US';
}
