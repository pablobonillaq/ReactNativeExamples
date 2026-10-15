import { useCallback } from 'react';
import { verifyPin } from './pin';
import { authenticateWithBiometrics, type VaultConfig } from './vaultStorage';

/**
 * The two ways to prove it's the owner, depending on the configuration:
 * - checkPin: compares the PIN with the stored hash.
 * - promptBiometrics: shows the system Face ID / Touch ID / biometric prompt.
 */
export function useVaultAuth(config: VaultConfig | null) {
  const checkPin = useCallback(
    async (pin: string) =>
      config?.method === 'pin' ? verifyPin(pin, config.pin) : false,
    [config],
  );

  const promptBiometrics = useCallback(
    (reason: string) =>
      config?.method === 'biometric'
        ? authenticateWithBiometrics(reason)
        : Promise.resolve(false),
    [config],
  );

  return { checkPin, promptBiometrics };
}
