import { useHeaderHeight } from '@react-navigation/elements';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  AppState,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import type { BIOMETRY_TYPE } from 'react-native-keychain';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import i18n from '../../i18n';
import type { RootStackScreenProps } from '../../navigation/types';
import { SettingsHeaderButton } from '../../settings/SettingsDrawer';
import { makeStyles } from '../../theme';
import { SetupView } from './SetupView';
import { UnlockView } from './UnlockView';
import { useLockout } from './useLockout';
import { useVaultColors, vaultPalette } from './vaultColors';
import { VaultContent } from './VaultContent';
import {
  biometryLabel,
  getBiometryType,
  loadConfig,
  loadEntries,
  resetVault,
  type VaultConfig,
  type VaultEntry,
} from './vaultStorage';
import { VaultButton } from './VaultUi';
import { createLogger } from '../../observability/logger';

const log = createLogger('Vault');

type Phase =
  | { name: 'loading' }
  | { name: 'setup' }
  | { name: 'locked'; config: VaultConfig }
  | { name: 'unlocked'; config: VaultConfig };

/**
 * Password vault:
 * 1. First time: choose a 6-digit PIN or biometrics (Face ID / Touch ID /
 *    Android biometrics).
 * 2. Every time: unlock with it (5 wrong PINs = blocked for 1 minute).
 * 3. Unlocked: save Info / User / Password in secure storage; passwords are
 *    masked and the eye button asks for the PIN or biometrics again.
 * The vault locks itself when the app goes to the background.
 */
export function VaultScreen({ navigation }: RootStackScreenProps<'Vault'>) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const vaultColors = useVaultColors();
  const { t } = useTranslation('vault');
  const lockout = useLockout();
  const [phase, setPhase] = useState<Phase>({ name: 'loading' });
  const [biometryType, setBiometryType] = useState<BIOMETRY_TYPE | null>(null);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const biometricName = biometryLabel(biometryType);

  useEffect(() => {
    Promise.all([loadConfig(), getBiometryType()])
      .then(([config, type]) => {
        log.info('Vault opened', {
          configured: Boolean(config),
          method: config?.method,
        });
        setBiometryType(type);
        setPhase(config ? { name: 'locked', config } : { name: 'setup' });
      })
      .catch(error => {
        log.error('Could not read the vault config', error);
        Alert.alert(i18n.t('vault:storageError'), String(error));
        setPhase({ name: 'setup' });
      });
  }, []);

  const unlock = async (config: VaultConfig) => {
    try {
      const saved = await loadEntries();
      // Only the count: the entries themselves are secret.
      log.info('Vault unlocked', {
        method: config.method,
        entries: saved.length,
      });
      setEntries(saved);
      setPhase({ name: 'unlocked', config });
    } catch (error) {
      log.error('Could not load vault entries', error);
      Alert.alert(i18n.t('vault:storageError'), String(error));
    }
  };

  const lock = () => {
    log.info('Vault locked');
    setEntries([]); // don't keep secrets in memory while locked
    setPhase(current =>
      current.name === 'unlocked'
        ? { name: 'locked', config: current.config }
        : current,
    );
  };

  // Lock when the app goes to the background.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'background') {
        lock();
      }
    });
    return () => subscription.remove();
  }, []);

  // Vault-colored header, with a "Lock" button while unlocked (next to the
  // ⚙️ settings button that every header has).
  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: vaultColors.headerBackground },
      headerTintColor: vaultColors.headerTint,
      headerRight:
        phase.name === 'unlocked'
          ? () => (
              <View style={styles.headerRight}>
                <Pressable
                  onPress={lock}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t('header.lockA11y')}
                >
                  <Text style={styles.lockText}>{t('header.lock')}</Text>
                </Pressable>
                <SettingsHeaderButton icon="⚙️" />
              </View>
            )
          : renderSettingsButton,
    });
  }, [navigation, phase.name, vaultColors, styles, t]);

  const confirmReset = () =>
    Alert.alert(t('reset.title'), t('reset.message'), [
      { text: t('reset.cancel'), style: 'cancel' },
      {
        text: t('reset.confirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await resetVault();
          } catch (error) {
            log.error('Could not reset the vault', error);
            return;
          }
          lockout.registerSuccess();
          setEntries([]);
          setPhase({ name: 'setup' });
        },
      },
    ]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {phase.name === 'loading' ? (
          <ActivityIndicator
            size="large"
            color={vaultColors.accent}
            style={styles.loading}
          />
        ) : phase.name === 'setup' ? (
          <SetupView biometryType={biometryType} onConfigured={unlock} />
        ) : phase.name === 'locked' ? (
          <UnlockView
            config={phase.config}
            biometricName={biometricName}
            lockout={lockout}
            onUnlocked={() => unlock(phase.config)}
          />
        ) : (
          <VaultContent
            config={phase.config}
            biometricName={biometricName}
            lockout={lockout}
            entries={entries}
            onEntriesChange={setEntries}
          />
        )}

        {phase.name !== 'loading' && phase.name !== 'setup' ? (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('footer.protectedWith', {
                method:
                  phase.config.method === 'pin'
                    ? t('footer.pin')
                    : biometricName,
              })}
            </Text>
            <VaultButton
              label={t('reset.button')}
              variant="danger"
              onPress={confirmReset}
              accessibilityHint={t('reset.hint')}
            />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const renderSettingsButton = () => <SettingsHeaderButton icon="⚙️" />;

const useStyles = makeStyles((_c, theme) => {
  const v = vaultPalette(theme);
  return {
    container: {
      flex: 1,
      backgroundColor: v.background,
    },
    content: {
      padding: 16,
      gap: 16,
    },
    loading: {
      marginTop: 80,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    lockText: {
      fontSize: 15,
      fontWeight: '700',
      color: v.accent,
    },
    footer: {
      alignItems: 'center',
      gap: 4,
      marginTop: 8,
    },
    footerText: {
      fontSize: 12,
      color: v.muted,
    },
  };
});
