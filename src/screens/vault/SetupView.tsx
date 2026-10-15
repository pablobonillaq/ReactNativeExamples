import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';
import type { BIOMETRY_TYPE } from 'react-native-keychain';
import { makeStyles } from '../../theme';
import { hashPin } from './pin';
import { PinField } from './PinField';
import { vaultPalette } from './vaultColors';
import {
  authenticateWithBiometrics,
  biometryLabel,
  enableBiometricKey,
  saveConfig,
  type VaultConfig,
} from './vaultStorage';
import { Card, Hero, VaultButton } from './VaultUi';
import { createLogger } from '../../observability/logger';

const log = createLogger('VaultSetup');

type Step = 'choose' | 'pin' | 'confirm';

/** First time: the user picks how to protect the vault. */
export function SetupView({
  biometryType,
  onConfigured,
}: {
  biometryType: BIOMETRY_TYPE | null;
  onConfigured: (config: VaultConfig) => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation('vault');
  const [step, setStep] = useState<Step>('choose');
  const [firstPin, setFirstPin] = useState('');
  const [busy, setBusy] = useState(false);
  const biometricName = biometryLabel(biometryType);

  const useBiometrics = async () => {
    setBusy(true);
    try {
      await enableBiometricKey();
      // Ask once now: confirms the user can actually pass the check.
      const ok = await authenticateWithBiometrics(
        t('setup.biometricPrompt', { method: biometricName }),
      );
      if (!ok) {
        log.warn('Biometric setup not confirmed');
        Alert.alert(
          t('setup.notConfirmedTitle', { method: biometricName }),
          t('setup.notConfirmedMessage'),
        );
        return;
      }
      const config: VaultConfig = { method: 'biometric' };
      await saveConfig(config);
      log.info('Vault configured', { method: 'biometric' });
      onConfigured(config);
    } catch (error) {
      log.error('Could not set up biometrics', error);
      Alert.alert(t('setup.biometricError'), String(error));
    } finally {
      setBusy(false);
    }
  };

  if (step === 'pin') {
    return (
      <Card>
        <PinField
          key="pin"
          label={t('setup.choosePin')}
          onSubmit={async pin => {
            setFirstPin(pin);
            setStep('confirm');
            return true;
          }}
        />
        <VaultButton
          label={t('setup.back')}
          variant="secondary"
          onPress={() => setStep('choose')}
        />
      </Card>
    );
  }

  if (step === 'confirm') {
    return (
      <Card>
        <PinField
          key="confirm"
          label={t('setup.repeatPin')}
          errorMessage={t('setup.mismatch')}
          onSubmit={async pin => {
            if (pin !== firstPin) {
              log.info('PIN confirmation did not match');
              return false;
            }
            const config: VaultConfig = {
              method: 'pin',
              pin: await hashPin(pin),
            };
            await saveConfig(config);
            log.info('Vault configured', { method: 'pin' });
            onConfigured(config);
            return true;
          }}
        />
        <VaultButton
          label={t('setup.startOver')}
          variant="secondary"
          onPress={() => {
            setFirstPin('');
            setStep('pin');
          }}
        />
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <Hero icon="🔐" title={t('setup.title')} subtitle={t('setup.subtitle')} />
      <Card>
        <VaultButton
          label={t('setup.usePin')}
          onPress={() => setStep('pin')}
          accessibilityHint={t('setup.usePinHint')}
        />
        <VaultButton
          label={t('setup.useBiometrics', {
            icon: biometryType ? '🫆' : '🚫',
            method: biometricName,
          })}
          variant="secondary"
          disabled={!biometryType || busy}
          onPress={useBiometrics}
          accessibilityHint={t('setup.useBiometricsHint')}
        />
        {!biometryType ? (
          <Text style={styles.note}>{t('setup.noBiometrics')}</Text>
        ) : null}
      </Card>
    </View>
  );
}

const useStyles = makeStyles((_c, theme) => {
  const v = vaultPalette(theme);
  return {
    container: {
      gap: 16,
    },
    note: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
      color: v.muted,
    },
  };
});
