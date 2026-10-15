module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Required by react-native-reanimated (used by the drawer). Must be last.
  plugins: ['react-native-worklets/plugin'],
};
