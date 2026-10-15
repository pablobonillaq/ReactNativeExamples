import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { PinField } from './PinField';
import type { Lockout } from './useLockout';
import { useVaultAuth } from './useVaultAuth';
import type { VaultConfig } from './vaultStorage';
import { Card, Hero, VaultButton } from './VaultUi';

/** Asks for the PIN or biometrics before showing the vault. */
export function UnlockView({
  config,
  biometricName,
  lockout,
  onUnlocked,
}: {
  config: VaultConfig;
  biometricName: string;
  lockout: Lockout;
  onUnlocked: () => void;
}) {
  const { checkPin, promptBiometrics } = useVaultAuth(config);
  const { t } = useTranslation('vault');
  const prompted = useRef(false);

  const unlockWithBiometrics = async () => {
    if (await promptBiometrics(t('unlock.biometricPrompt'))) {
      onUnlocked();
    }
  };

  // Show the biometric prompt right away, once.
  useEffect(() => {
    if (config.method === 'biometric' && !prompted.current) {
      prompted.current = true;
      unlockWithBiometrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Hero
        icon="🔒"
        title={t('unlock.title')}
        subtitle={
          config.method === 'pin'
            ? t('unlock.pinSubtitle')
            : t('unlock.biometricSubtitle', { method: biometricName })
        }
      />
      <Card>
        {config.method === 'pin' ? (
          <PinField
            label={t('method.pin')}
            lockout={lockout}
            onSubmit={async pin => {
              const ok = await checkPin(pin);
              if (ok) {
                onUnlocked();
              }
              return ok;
            }}
          />
        ) : (
          <VaultButton
            label={t('unlock.biometricButton', { method: biometricName })}
            onPress={unlockWithBiometrics}
          />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
