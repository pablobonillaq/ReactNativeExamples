/**
 * In-memory stand-in for react-native-keychain (native-only). Each service
 * keeps one { username, password }. Biometrics are reported as unavailable.
 */
const store = new Map();

module.exports = {
  ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly' },
  ACCESS_CONTROL: { BIOMETRY_CURRENT_SET: 'BiometryCurrentSet' },
  STORAGE_TYPE: { AES_GCM: 'KeystoreAESGCM' },
  BIOMETRY_TYPE: {
    TOUCH_ID: 'TouchID',
    FACE_ID: 'FaceID',
    FINGERPRINT: 'Fingerprint',
    FACE: 'Face',
    IRIS: 'Iris',
  },
  async setGenericPassword(username, password, options = {}) {
    store.set(options.service ?? 'default', { username, password });
    return { service: options.service, storage: 'mock' };
  },
  async getGenericPassword(options = {}) {
    const item = store.get(options.service ?? 'default');
    return item ? { ...item, service: options.service } : false;
  },
  async resetGenericPassword(options = {}) {
    return store.delete(options.service ?? 'default');
  },
  async getSupportedBiometryType() {
    return null;
  },
  __reset() {
    store.clear();
  },
};
