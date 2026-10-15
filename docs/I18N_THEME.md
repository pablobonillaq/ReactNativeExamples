# Languages (i18next) and light / dark theme

The app is translated to **English** and **Spanish** and follows the
**light / dark** mode. Both are chosen in the settings drawer (☰ on the home
screen, ⚙️ in the other headers, or swipe from the left edge on the home
screen) and saved in AsyncStorage.

| Setting | Options | Default | Saved in |
| --- | --- | --- | --- |
| Language | English, Español | Device language | `@settings/language` |
| Theme | System, Light, Dark | System (follows the phone, live) | `@settings/theme` |

## Files

- `src/i18n/index.ts`: i18next setup (imported in `index.js`).
- `src/i18n/locales/<language>/<namespace>.ts`: the texts. One namespace per feature.
- `src/i18n/resources.ts`: registers every namespace.
- `src/settings/settingsStore.ts`: language + theme preference, AsyncStorage.
- `src/settings/SettingsDrawer.tsx`: the drawer and the ☰ / ⚙️ header buttons.
- `src/theme/colors.ts`: light and dark color tokens.
- `src/theme/index.ts`: `useTheme()` and `makeStyles()`.

## Translating a component

```tsx
import { useTranslation } from 'react-i18next';

function TodoItem() {
  const { t } = useTranslation('todo'); // namespace = file name in locales/
  return <Text>{t('item.delete')}</Text>;
}
```

- Texts go in `src/i18n/locales/en/<ns>.ts` (plain object) and
  `src/i18n/locales/es/<ns>.ts`, typed `Translation<typeof en>`: a missing or
  extra key in Spanish is a TypeScript error.
- Variables: `'Hello {{name}}'` → `t('hello', { name })`.
- Plurals: `item_one` / `item_other` → `t('item', { count })`.
- Text with styled parts: `<Trans t={t} i18nKey="key" components={{ b: <Text style={styles.bold} /> }} />`
  with `'Press <b>Save</b>'`.
- Outside components (alerts, toasts, helpers): `i18n.t('todo:key')` with
  `import i18n from '…/i18n'`. Call it when the text is shown, never at module
  load, so it uses the current language.
- Dates and numbers: `date.toLocaleDateString(currentLocale(), …)`
  (`currentLocale()` from `src/i18n`).
- Not translated: log messages, analytics / Sentry names, test IDs, storage
  keys, code samples and API names, data from APIs.

## Theming a component

```tsx
import { makeStyles, useTheme } from '../../theme';

const useStyles = makeStyles((c, theme) => ({
  card: { backgroundColor: c.surface, borderColor: c.border },
  title: { color: c.text },
  shadow: { shadowOpacity: theme.isDark ? 0 : 0.08 },
}));

function Card() {
  const styles = useStyles();          // themed StyleSheet (cached)
  const { colors } = useTheme();       // for color props
  return <ActivityIndicator color={colors.primary} />;
}
```

- No hex / rgb values outside `src/theme/colors.ts`: pick the token by role
  (`background`, `surface`, `text`, `textMuted`, `border`, `primary`,
  `danger`…). See the comments in `colors.ts`.
- `theme.isDark` for small differences (shadows, image overlays).
- System mode updates live: Android declares `uiMode` in
  `android:configChanges`, so `useColorScheme()` changes without restarting.
  Forced Light / Dark also apply to native UI (date pickers, alerts) through
  `Appearance.setColorScheme`.

## Adding a language

1. Copy `src/i18n/locales/en` to `src/i18n/locales/<code>` and translate.
2. Register it in `src/i18n/resources.ts` and add the code to `LANGUAGES`
   (`src/i18n/languages.ts`).
3. Add its name to the `settings` namespace (`language.<code>`).

## Tests

`jest.setup.js` sets English and loaded settings, so tests can look for the
English texts. Switch with `i18n.changeLanguage('es')` inside a test.
