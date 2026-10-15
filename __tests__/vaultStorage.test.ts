import { hashPin, verifyPin } from '../src/screens/vault/pin';
import {
  loadConfig,
  loadEntries,
  resetVault,
  saveConfig,
  saveEntries,
  type VaultConfig,
} from '../src/screens/vault/vaultStorage';

const keychain = require('react-native-keychain');

beforeEach(() => keychain.__reset());

test('PIN config round-trips through secure storage (hash only)', async () => {
  const config: VaultConfig = { method: 'pin', pin: await hashPin('246810') };
  await saveConfig(config);

  const loaded = await loadConfig();
  expect(loaded?.method).toBe('pin');
  expect(JSON.stringify(loaded)).not.toContain('246810');
  if (loaded?.method === 'pin') {
    await expect(verifyPin('246810', loaded.pin)).resolves.toBe(true);
  }
});

test('entries are saved and loaded', async () => {
  expect(await loadEntries()).toEqual([]);
  const entry = {
    id: '1',
    info: 'Gmail',
    user: 'me@example.com',
    password: 's3cret!',
    createdAt: 1,
  };
  await saveEntries([entry]);
  expect(await loadEntries()).toEqual([entry]);
});

test('reset deletes everything', async () => {
  await saveConfig({ method: 'biometric' });
  await saveEntries([
    { id: '1', info: 'a', user: 'b', password: 'c', createdAt: 1 },
  ]);
  await resetVault();
  expect(await loadConfig()).toBeNull();
  expect(await loadEntries()).toEqual([]);
});
