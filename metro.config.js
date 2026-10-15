const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withSentryConfig } = require('@sentry/react-native/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Workaround for a React Native 0.87.1 bug: its own package
    // @react-native/virtualized-lists (FlatList) imports
    // "react-native/src/private/featureflags/ReactNativeFeatureFlags", but
    // react-native's package.json "exports" doesn't expose ./src/private/*,
    // so Metro warns and falls back to the file anyway. Resolve only those
    // internal paths directly by file, keeping "exports" for everything else.
    // Remove this once a React Native release fixes it.
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith('react-native/src/private/')) {
        return context.resolveRequest(
          { ...context, unstable_enablePackageExports: false },
          moduleName,
          platform,
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

// withSentryConfig adds a Debug ID to each bundle and its source map, so
// Sentry can show the original TypeScript lines in stack traces.
module.exports = withSentryConfig(
  mergeConfig(getDefaultConfig(__dirname), config),
);
