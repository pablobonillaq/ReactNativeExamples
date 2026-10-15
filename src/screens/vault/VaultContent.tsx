import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { TextField } from '../../components/form/TextField';
import { makeStyles } from '../../theme';
import { PinField } from './PinField';
import type { Lockout } from './useLockout';
import { useVaultAuth } from './useVaultAuth';
import { useVaultColors, vaultPalette } from './vaultColors';
import { saveEntries, type VaultConfig, type VaultEntry } from './vaultStorage';
import { Card, VaultButton } from './VaultUi';
import { createLogger } from '../../observability/logger';

const log = createLogger('VaultContent');

/** A revealed password hides itself again after this long. */
const REVEAL_MS = 30_000;

/** Unlocked vault: form to add a password + list of saved ones. */
export function VaultContent({
  config,
  biometricName,
  lockout,
  entries,
  onEntriesChange,
}: {
  config: VaultConfig;
  biometricName: string;
  lockout: Lockout;
  entries: VaultEntry[];
  onEntriesChange: (entries: VaultEntry[]) => void;
}) {
  const { checkPin, promptBiometrics } = useVaultAuth(config);
  const styles = useStyles();
  const { t } = useTranslation('vault');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [pinPromptFor, setPinPromptFor] = useState<VaultEntry | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const pending = timers.current;
    return () => Object.values(pending).forEach(clearTimeout);
  }, []);

  const reveal = (id: string) => {
    log.info('Password revealed', { entryId: id });
    setRevealed(current => new Set(current).add(id));
    clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => hide(id), REVEAL_MS);
  };

  const hide = (id: string) => {
    clearTimeout(timers.current[id]);
    setRevealed(current => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  };

  // Eye button: hide if visible; otherwise ask for PIN / biometrics first.
  const onEyePress = async (entry: VaultEntry) => {
    if (revealed.has(entry.id)) {
      hide(entry.id);
      return;
    }
    if (config.method === 'pin') {
      setPinPromptFor(entry);
    } else if (
      await promptBiometrics(t('content.revealPrompt', { info: entry.info }))
    ) {
      reveal(entry.id);
    }
  };

  const addEntry = async (entry: Omit<VaultEntry, 'id' | 'createdAt'>) => {
    const next = [
      ...entries,
      {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
      },
    ];
    await saveEntries(next);
    log.info('Password saved', { entries: next.length });
    onEntriesChange(next);
  };

  return (
    <View style={styles.container}>
      <NewEntryForm onSave={addEntry} />

      <Text style={styles.sectionTitle} accessibilityRole="header">
        {t('content.savedTitle', { number: entries.length })}
      </Text>
      {entries.length === 0 ? (
        <Text style={styles.empty}>{t('content.empty')}</Text>
      ) : (
        entries.map(entry => (
          <EntryRow
            key={entry.id}
            entry={entry}
            visible={revealed.has(entry.id)}
            onEyePress={() => onEyePress(entry)}
            authName={config.method === 'pin' ? t('method.pin') : biometricName}
          />
        ))
      )}

      <Modal
        visible={pinPromptFor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPinPromptFor(null)}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t('content.modalTitle', { info: pinPromptFor?.info ?? '' })}
            </Text>
            <PinField
              label={t('content.enterPin')}
              lockout={lockout}
              onSubmit={async pin => {
                const ok = await checkPin(pin);
                if (ok && pinPromptFor) {
                  reveal(pinPromptFor.id);
                  setPinPromptFor(null);
                }
                return ok;
              }}
            />
            <VaultButton
              label={t('content.cancel')}
              variant="secondary"
              onPress={() => setPinPromptFor(null)}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function NewEntryForm({
  onSave,
}: {
  onSave: (entry: {
    info: string;
    user: string;
    password: string;
  }) => Promise<void>;
}) {
  const styles = useStyles();
  const vaultColors = useVaultColors();
  const { t } = useTranslation('vault');
  const [info, setInfo] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = {
    info: info.trim() ? undefined : t('form.errors.info'),
    user: user.trim() ? undefined : t('form.errors.user'),
    password: password ? undefined : t('form.errors.password'),
  };
  const valid = !errors.info && !errors.user && !errors.password;

  const save = async () => {
    setSubmitted(true);
    if (!valid) {
      return;
    }
    setSaving(true);
    try {
      await onSave({ info: info.trim(), user: user.trim(), password });
      setInfo('');
      setUser('');
      setPassword('');
      setSubmitted(false);
      Toast.show({ type: 'success', text1: t('form.saved') });
    } catch (error) {
      log.error('Could not save the password', error);
      Toast.show({
        type: 'error',
        text1: t('form.saveError'),
        text2: String(error),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {t('form.title')}
      </Text>
      <TextField
        labelStyle={styles.fieldLabel}
        style={styles.fieldInput}
        placeholderTextColor={vaultColors.muted}
        label={t('form.info')}
        icon="🏷️"
        value={info}
        onChangeText={setInfo}
        placeholder={t('form.infoPlaceholder')}
        error={submitted ? errors.info : undefined}
      />
      <TextField
        labelStyle={styles.fieldLabel}
        style={styles.fieldInput}
        placeholderTextColor={vaultColors.muted}
        label={t('form.user')}
        icon="👤"
        value={user}
        onChangeText={setUser}
        placeholder={t('form.userPlaceholder')}
        autoCapitalize="none"
        autoCorrect={false}
        error={submitted ? errors.user : undefined}
      />
      <TextField
        labelStyle={styles.fieldLabel}
        style={styles.fieldInput}
        placeholderTextColor={vaultColors.muted}
        label={t('form.password')}
        icon="🔑"
        value={password}
        onChangeText={setPassword}
        placeholder={t('form.passwordPlaceholder')}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        error={submitted ? errors.password : undefined}
      />
      <VaultButton
        label={saving ? t('form.saving') : t('form.save')}
        onPress={save}
        disabled={saving}
        accessibilityHint={t('form.saveHint')}
      />
    </Card>
  );
}

const MASK = '••••••••••';

function EntryRow({
  entry,
  visible,
  onEyePress,
  authName,
}: {
  entry: VaultEntry;
  visible: boolean;
  onEyePress: () => void;
  authName: string;
}) {
  const styles = useStyles();
  const { t } = useTranslation('vault');
  return (
    <View style={styles.row}>
      <View style={styles.rowBody}>
        <Text style={styles.rowInfo} numberOfLines={1}>
          {entry.info}
        </Text>
        <Text style={styles.rowUser} numberOfLines={1}>
          {entry.user}
        </Text>
        <Text
          style={[styles.rowPassword, visible && styles.rowPasswordVisible]}
          selectable={visible}
          accessibilityLabel={
            visible
              ? t('entry.passwordA11y', { password: entry.password })
              : t('entry.passwordHidden')
          }
        >
          {visible ? entry.password : MASK}
        </Text>
      </View>
      <Pressable
        onPress={onEyePress}
        hitSlop={8}
        style={styles.eyeButton}
        accessibilityRole="button"
        accessibilityLabel={visible ? t('entry.hide') : t('entry.show')}
        accessibilityHint={
          visible ? undefined : t('entry.requires', { method: authName })
        }
      >
        <Text style={styles.eyeIcon}>{visible ? '🙈' : '👁️'}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((_c, theme) => {
  const v = vaultPalette(theme);
  return {
    container: {
      gap: 14,
    },
    fieldLabel: {
      color: v.muted,
    },
    fieldInput: {
      color: v.text,
      borderColor: v.border,
      backgroundColor: v.background,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: v.text,
    },
    empty: {
      fontSize: 14,
      color: v.muted,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 12,
      backgroundColor: v.surface,
    },
    rowBody: {
      flex: 1,
      gap: 2,
    },
    rowInfo: {
      fontSize: 16,
      fontWeight: '700',
      color: v.text,
    },
    rowUser: {
      fontSize: 13,
      color: v.muted,
    },
    rowPassword: {
      marginTop: 4,
      fontSize: 16,
      letterSpacing: 2,
      color: v.muted,
    },
    rowPasswordVisible: {
      letterSpacing: 0.5,
      fontFamily: 'monospace',
      color: v.success,
    },
    eyeButton: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 24,
      backgroundColor: v.background,
    },
    eyeIcon: {
      fontSize: 22,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: v.overlay,
    },
    modalCard: {
      gap: 16,
      padding: 20,
      borderRadius: 16,
      backgroundColor: v.background,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
      color: v.text,
    },
  };
});
