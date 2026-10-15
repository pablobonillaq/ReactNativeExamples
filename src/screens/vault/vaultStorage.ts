import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import i18n from '../../i18n';
import { INITIAL_LOCKOUT, type LockoutState } from './lockout';
import type { PinHash } from './pin';
import { createLogger } from '../../observability/logger';

const log = createLogger('VaultStorage');

/**
 * Everything secret lives in react-native-keychain: the iOS Keychain and,
 * on Android, values encrypted with keys in the Android Keystore (hardware
 * backed when available). Each "service" is an independent secure entry.
 */
const SERVICES = {
  config: 'com.reactnativeexamples.vault.config',
  entries: 'com.reactnativeexamples.vault.entries',
  biometric: 'com.reactnativeexamples.vault.biometric',
};

/** Not secret: only when PIN entry is blocked. */
const LOCKOUT_KEY = '@ReactNativeExamples/vaultLockout';

const SECURE: Keychain.SetOptions = {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export type AuthMethod = 'pin' | 'biometric';

export type VaultConfig =
  | { method: 'pin'; pin: PinHash }
  | { method: 'biometric' };

export type VaultEntry = {
  id: string;
  info: string;
  user: string;
  password: string;
  createdAt: number;
};

async function readJson<T>(service: string): Promise<T | null> {
  const credentials = await Keychain.getGenericPassword({ service });
  return credentials ? (JSON.parse(credentials.password) as T) : null;
}

async function writeJson(service: string, value: unknown) {
  const ok = await Keychain.setGenericPassword('data', JSON.stringify(value), {
    ...SECURE,
    service,
  });
  if (!ok) {
    throw new Error('Could not write to secure storage');
  }
  log.debug('Secure entry written', { service });
}

// ---------- Configuration (how the vault is unlocked) ----------

export function loadConfig() {
  return readJson<VaultConfig>(SERVICES.config);
}

export function saveConfig(config: VaultConfig) {
  return writeJson(SERVICES.config, config);
}

// ---------- Saved passwords ----------

export async function loadEntries() {
  return (await readJson<VaultEntry[]>(SERVICES.entries)) ?? [];
}

export function saveEntries(entries: VaultEntry[]) {
  return writeJson(SERVICES.entries, entries);
}

// ---------- Biometrics ----------

/** "FaceID", "TouchID", "Fingerprint", "Face", "Iris" or null if none. */
export async function getBiometryType() {
  try {
    const type = await Keychain.getSupportedBiometryType();
    log.info('Supported biometry', { type: type ?? 'none' });
    return type;
  } catch (error) {
    log.warn('Could not read the biometry type', {}, error);
    return null;
  }
}

/** Name shown to the user, in the current language (call it when rendering). */
export function biometryLabel(type: Keychain.BIOMETRY_TYPE | null) {
  switch (type) {
    case Keychain.BIOMETRY_TYPE.FACE_ID:
      return i18n.t('vault:biometry.faceId');
    case Keychain.BIOMETRY_TYPE.TOUCH_ID:
      return i18n.t('vault:biometry.touchId');
    case Keychain.BIOMETRY_TYPE.FINGERPRINT:
      return i18n.t('vault:biometry.fingerprint');
    case Keychain.BIOMETRY_TYPE.FACE:
      return i18n.t('vault:biometry.face');
    case Keychain.BIOMETRY_TYPE.IRIS:
      return i18n.t('vault:biometry.iris');
    default:
      return i18n.t('vault:biometry.generic');
  }
}

/**
 * Stores a token that the OS only releases after a successful biometric
 * check (ACCESS_CONTROL.BIOMETRY_CURRENT_SET: adding a new fingerprint or
 * face invalidates it).
 */
export async function enableBiometricKey() {
  const ok = await Keychain.setGenericPassword(
    'biometric',
    `${Date.now()}-${Math.random()}`,
    {
      ...SECURE,
      service: SERVICES.biometric,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      storage: Keychain.STORAGE_TYPE.AES_GCM,
    },
  );
  if (!ok) {
    throw new Error('Could not create the biometric key');
  }
  log.info('Biometric key created');
}

/**
 * Shows the system Face ID / Touch ID / biometric prompt. Resolves true
 * only if the user passed it (reading the protected token succeeded).
 */
export async function authenticateWithBiometrics(reason: string) {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICES.biometric,
      authenticationPrompt: {
        title: reason,
        cancel: i18n.t('vault:biometricPrompt.cancel'),
      },
    });
    log.info('Biometric prompt finished', { passed: Boolean(credentials) });
    return Boolean(credentials);
  } catch (error) {
    // Cancelled, too many attempts or biometrics changed.
    log.warn('Biometric prompt failed or cancelled', {}, error);
    return false;
  }
}

// ---------- Lockout ----------

export async function loadLockout(): Promise<LockoutState> {
  try {
    const json = await AsyncStorage.getItem(LOCKOUT_KEY);
    return json ? JSON.parse(json) : INITIAL_LOCKOUT;
  } catch (error) {
    log.warn('Could not load the lockout state', {}, error);
    return INITIAL_LOCKOUT;
  }
}

export function saveLockout(state: LockoutState) {
  return AsyncStorage.setItem(LOCKOUT_KEY, JSON.stringify(state)).catch(error =>
    log.warn('Could not save the lockout state', {}, error),
  );
}

// ---------- Reset ----------

export async function resetVault() {
  await Promise.all(
    Object.values(SERVICES).map(service =>
      Keychain.resetGenericPassword({ service }),
    ),
  );
  await AsyncStorage.removeItem(LOCKOUT_KEY);
  log.info('Vault reset');
}
