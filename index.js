/**
 * @format
 */

// Must be the first import: Sentry starts capturing errors from here on.
import './src/observability/sentry';
import { AppRegistry } from 'react-native';
import { initFirebase } from './src/observability/firebase';
// i18next: must be initialized before any component calls useTranslation.
import './src/i18n';
import { loadSettings } from './src/settings/settingsStore';
import App from './App';
import { name as appName } from './app.json';

// Firebase Crashlytics + Analytics (keys for every report).
initFirebase();

// Saved language and theme (AsyncStorage). The app waits for them to render.
loadSettings();

AppRegistry.registerComponent(appName, () => App);
