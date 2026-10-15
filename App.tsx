/**
 * React Native Examples
 *
 * @format
 */

import {
  createNavigationContainerRef,
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { linking } from './src/navigation/linking';
import { AppErrorBoundary } from './src/observability/AppErrorBoundary';
import {
  setCrashlyticsAttribute,
  trackScreen,
} from './src/observability/firebase';
import { createLogger } from './src/observability/logger';
import { navigationIntegration, Sentry } from './src/observability/sentry';
import { AccessibilityScreen } from './src/screens/accessibility/AccessibilityScreen';
import type { RootStackParamList } from './src/navigation/types';
import { BreakingBadScreen } from './src/screens/breakingBad/BreakingBadScreen';
import { BridgingScreen } from './src/screens/bridging/BridgingScreen';
import { BusesMapScreen } from './src/screens/buses/BusesMapScreen';
import { CharacterDetailScreen } from './src/screens/breakingBad/CharacterDetailScreen';
import { DeepLinkDemoScreen } from './src/screens/deepLinkDemo/DeepLinkDemoScreen';
import { PersonFormRHFScreen } from './src/screens/form/PersonFormRHFScreen';
import { PersonFormScreen } from './src/screens/form/PersonFormScreen';
import { PhotoGalleryScreen } from './src/screens/photos/PhotoGalleryScreen';
import { SentryDebugScreen } from './src/screens/debug/SentryDebugScreen';
import { AnimatedApiScreen } from './src/screens/animated/AnimatedApiScreen';
import { ReanimatedScreen } from './src/screens/reanimated/ReanimatedScreen';
import { FlipperScreen } from './src/screens/flipper/FlipperScreen';
import { HermesScreen } from './src/screens/hermes/HermesScreen';
import { RerendersScreen } from './src/screens/rerenders/RerendersScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { NavDetailScreen } from './src/screens/navigationDemo/NavDetailScreen';
import { NavigationDemoScreen } from './src/screens/navigationDemo/NavigationDemoScreen';
import { ListsScreen } from './src/screens/lists/ListsScreen';
import { PokemonInfiniteScreen } from './src/screens/pokemon/PokemonInfiniteScreen';
import { PokemonScreen } from './src/screens/pokemon/PokemonScreen';
import { TodoMobxScreen } from './src/screens/todo/mobx/TodoMobxScreen';
import { ShareScreen } from './src/screens/share/ShareScreen';
import { TodoReduxScreen } from './src/screens/todo/redux/TodoReduxScreen';
import { TodoNativeScreen } from './src/screens/todo/native/TodoNativeScreen';
import { TodoSqliteScreen } from './src/screens/todo/sqlite/TodoSqliteScreen';
import { TodoStorageScreen } from './src/screens/todo/storage/TodoStorageScreen';
import { TodoScreen } from './src/screens/todo/TodoScreen';
import { VaultScreen } from './src/screens/vault/VaultScreen';
import { TodoZustandScreen } from './src/screens/todo/zustand/TodoZustandScreen';
import {
  SettingsDrawerLayout,
  SettingsHeaderButton,
} from './src/settings/SettingsDrawer';
import { useSettings } from './src/settings/settingsStore';
import { store } from './src/store';
import { useTheme, type Theme } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Lets code outside components (Sentry, logs) read the current screen. */
const navigationRef = createNavigationContainerRef<RootStackParamList>();

const log = createLogger('Navigation');
let previousRouteName: string | undefined;
const routeListeners = new Set<(name: string) => void>();

/** Logs every screen change with its params (also a Sentry breadcrumb). */
function onNavigationStateChange() {
  const route = navigationRef.getCurrentRoute();
  if (!route || route.name === previousRouteName) {
    return;
  }
  log.info(`Screen: ${route.name}`, {
    from: previousRouteName,
    params: route.params,
  });
  previousRouteName = route.name;
  routeListeners.forEach(listener => listener(route.name));
  // Every Sentry event and Crashlytics report says which screen it was.
  Sentry.setTag('screen', route.name);
  setCrashlyticsAttribute('screen', route.name);
  // Firebase Analytics → Pages and screens.
  trackScreen(route.name);
}

/** Logs URLs that open the app or arrive while it's running. */
function useDeepLinkLogging() {
  useEffect(() => {
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          log.info('App opened from a link', { url });
        }
      })
      .catch(error => log.warn('Could not read the initial URL', {}, error));
    const subscription = Linking.addEventListener('url', ({ url }) =>
      log.info('Link received', { url }),
    );
    return () => subscription.remove();
  }, []);
}

/** Name of the current screen, as React state (for the drawer swipe). */
function useCurrentRouteName() {
  const [name, setName] = useState(previousRouteName ?? 'Home');
  useEffect(() => {
    routeListeners.add(setName);
    return () => {
      routeListeners.delete(setName);
    };
  }, []);
  return name;
}

/** React Navigation theme (headers, backgrounds) from the app theme. */
function toNavigationTheme(theme: Theme): NavigationTheme {
  const base = theme.isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: theme.isDark,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };
}

function renderMenuButton() {
  return <SettingsHeaderButton icon="☰" />;
}

function renderSettingsButton() {
  return <SettingsHeaderButton icon="⚙️" />;
}

/**
 * Every screen of the app. Titles come from the 'navigation' translations,
 * so they change with the language.
 */
function RootNavigator() {
  const { t } = useTranslation('navigation');
  return (
    <Stack.Navigator
      screenOptions={{
        // ⚙️ in every header opens the settings drawer.
        headerRight: renderSettingsButton,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('screens.Home'),
          headerLeft: renderMenuButton,
          headerRight: undefined,
        }}
      />
      <Stack.Screen
        name="Lists"
        component={ListsScreen}
        options={{ title: t('screens.Lists') }}
      />
      <Stack.Screen
        name="Pokemon"
        component={PokemonScreen}
        options={{ title: t('screens.Pokemon') }}
      />
      <Stack.Screen
        name="PokemonInfinite"
        component={PokemonInfiniteScreen}
        options={{ title: t('screens.PokemonInfinite') }}
      />
      <Stack.Screen
        name="PersonForm"
        component={PersonFormScreen}
        options={{ title: t('screens.PersonForm') }}
      />
      <Stack.Screen
        name="PersonFormRHF"
        component={PersonFormRHFScreen}
        options={{ title: t('screens.PersonFormRHF') }}
      />
      <Stack.Screen
        name="NavigationDemo"
        component={NavigationDemoScreen}
        // The drawer inside renders its own header.
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NavDetail"
        component={NavDetailScreen}
        // Header title comes from the navigation params.
        options={({ route }) => ({ title: route.params.headerTitle })}
      />
      <Stack.Screen
        name="DeepLinkDemo"
        component={DeepLinkDemoScreen}
        options={{ title: t('screens.DeepLinkDemo') }}
      />
      <Stack.Screen
        name="BreakingBad"
        component={BreakingBadScreen}
        options={{ title: t('screens.BreakingBad') }}
      />
      <Stack.Screen
        name="Todo"
        component={TodoScreen}
        options={{ title: t('screens.Todo') }}
      />
      <Stack.Screen
        name="TodoRedux"
        component={TodoReduxScreen}
        options={{ title: t('screens.TodoRedux') }}
      />
      <Stack.Screen
        name="TodoZustand"
        component={TodoZustandScreen}
        options={{ title: t('screens.TodoZustand') }}
      />
      <Stack.Screen
        name="TodoMobx"
        component={TodoMobxScreen}
        options={{ title: t('screens.TodoMobx') }}
      />
      <Stack.Screen
        name="TodoStorage"
        component={TodoStorageScreen}
        options={{ title: t('screens.TodoStorage') }}
      />
      <Stack.Screen
        name="TodoSqlite"
        component={TodoSqliteScreen}
        options={{ title: t('screens.TodoSqlite') }}
      />
      <Stack.Screen
        name="TodoNative"
        component={TodoNativeScreen}
        options={{ title: t('screens.TodoNative') }}
      />
      <Stack.Screen
        name="PhotoGallery"
        component={PhotoGalleryScreen}
        options={{ title: t('screens.PhotoGallery') }}
      />
      <Stack.Screen
        name="Accessibility"
        component={AccessibilityScreen}
        options={{ title: t('screens.Accessibility') }}
      />
      <Stack.Screen
        name="Vault"
        component={VaultScreen}
        options={{ title: t('screens.Vault') }}
      />
      <Stack.Screen
        name="BusesMap"
        component={BusesMapScreen}
        options={{ title: t('screens.BusesMap') }}
      />
      <Stack.Screen
        name="Share"
        component={ShareScreen}
        options={{ title: t('screens.Share') }}
      />
      <Stack.Screen
        name="AnimatedApi"
        component={AnimatedApiScreen}
        options={{ title: t('screens.AnimatedApi') }}
      />
      <Stack.Screen
        name="Reanimated"
        component={ReanimatedScreen}
        options={{ title: t('screens.Reanimated') }}
      />
      <Stack.Screen
        name="Flipper"
        component={FlipperScreen}
        options={{ title: t('screens.Flipper') }}
      />
      <Stack.Screen
        name="Hermes"
        component={HermesScreen}
        options={{ title: t('screens.Hermes') }}
      />
      <Stack.Screen
        name="Rerenders"
        component={RerendersScreen}
        options={{ title: t('screens.Rerenders') }}
      />
      <Stack.Screen
        name="Bridging"
        component={BridgingScreen}
        options={{ title: t('screens.Bridging') }}
      />
      <Stack.Screen
        name="SentryDebug"
        component={SentryDebugScreen}
        options={{ title: t('screens.SentryDebug') }}
      />
      <Stack.Screen
        name="BreakingBadCharacter"
        component={CharacterDetailScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
    </Stack.Navigator>
  );
}

/** Theme, settings drawer and navigation, once the settings are loaded. */
function ThemedApp() {
  const theme = useTheme();
  const { loaded } = useSettings();
  const routeName = useCurrentRouteName();
  const navigationTheme = useMemo(() => toNavigationTheme(theme), [theme]);

  if (!loaded) {
    // Saved language / theme are read in a few ms (index.js → loadSettings).
    return (
      <View
        style={[styles.root, { backgroundColor: theme.colors.background }]}
      />
    );
  }

  return (
    <>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      {/* `linking` maps rnexamples:// URLs to screens (deep links) */}
      <NavigationContainer
        ref={navigationRef}
        linking={linking}
        theme={navigationTheme}
        onReady={() => {
          // Sentry names traces and breadcrumbs after the screens.
          navigationIntegration.registerNavigationContainer(navigationRef);
          onNavigationStateChange();
        }}
        onStateChange={onNavigationStateChange}
      >
        {/* Side menu with the settings (language, theme) */}
        <SettingsDrawerLayout
          swipeEnabled={routeName === 'Home'}
          onGoHome={() => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('Home');
            }
          }}
        >
          <RootNavigator />
        </SettingsDrawerLayout>
      </NavigationContainer>
    </>
  );
}

function App() {
  useDeepLinkLogging();

  return (
    // Required by react-native-gesture-handler (drawer swipe gestures).
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {/* A component that throws while rendering shows ErrorFallback
            instead of a blank screen; the error is sent to Sentry and to
            Firebase Crashlytics (react-native-error-boundary). */}
        <AppErrorBoundary>
          {/* Redux store available to every screen (used by the Redux todo list) */}
          <Provider store={store}>
            <ThemedApp />
          </Provider>
        </AppErrorBoundary>
        {/* Must be rendered last so toasts appear above every screen */}
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

// Sentry.wrap adds touch breadcrumbs ("pressed X") and app start timing.
export default Sentry.wrap(App);
