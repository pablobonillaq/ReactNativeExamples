import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Text,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import { makeStyles } from '../../theme';
import { PIN_LENGTH } from './pin';
import type { Lockout } from './useLockout';
import { useVaultColors, vaultPalette } from './vaultColors';

type Props = {
  label: string;
  /** Returns true if the PIN is accepted. Called when 6 digits are typed. */
  onSubmit: (pin: string) => Promise<boolean>;
  /** Wrong-attempt counter. Omit it when choosing a new PIN. */
  lockout?: Lockout;
  /**
   * Message shown when onSubmit returns false (without lockout). Defaults
   * to "PINs do not match".
   */
  errorMessage?: string;
  autoFocus?: boolean;
};

/**
 * 6-digit PIN input. It submits automatically on the 6th digit. With a
 * `lockout`, wrong PINs count towards the 1-minute block and the input is
 * disabled while the countdown runs.
 */
export function PinField({
  label,
  onSubmit,
  lockout,
  errorMessage,
  autoFocus = true,
}: Props) {
  const styles = useStyles();
  const vaultColors = useVaultColors();
  const { t } = useTranslation('vault');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<TextInputInstance>(null);
  const locked = lockout?.isLocked ?? false;

  // When the countdown ends, clear the message and focus the input again.
  const wasLocked = useRef(locked);
  useEffect(() => {
    if (wasLocked.current && !locked) {
      setError(null);
      inputRef.current?.focus();
    }
    wasLocked.current = locked;
  }, [locked]);

  const checkingRef = useRef(false);

  const onChangeText = async (text: string) => {
    // Ignore typing while the previous PIN is being checked. (The input is
    // not disabled for this: disabling it would drop focus and the keyboard.)
    if (checkingRef.current) {
      return;
    }
    const digits = text.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setPin(digits);
    setError(null);
    if (digits.length < PIN_LENGTH) {
      return;
    }
    checkingRef.current = true;
    setChecking(true);
    const ok = await onSubmit(digits);
    checkingRef.current = false;
    setChecking(false);
    setPin('');
    if (ok) {
      lockout?.registerSuccess();
      return;
    }
    inputRef.current?.focus();
    if (lockout) {
      const left = lockout.attemptsLeft - 1;
      lockout.registerFailure();
      setError(left > 0 ? t('pin.wrong', { count: left }) : null);
    } else {
      setError(errorMessage ?? t('pin.mismatch'));
    }
  };

  const minutes = Math.floor((lockout?.secondsLeft ?? 0) / 60);
  const seconds = String((lockout?.secondsLeft ?? 0) % 60).padStart(2, '0');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          ref={inputRef}
          value={pin}
          onChangeText={onChangeText}
          editable={!locked}
          autoFocus={autoFocus && !locked}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={PIN_LENGTH}
          textContentType="oneTimeCode"
          placeholder={'•'.repeat(PIN_LENGTH)}
          placeholderTextColor={vaultColors.muted}
          style={[styles.input, locked && styles.inputLocked]}
          accessibilityLabel={label}
          accessibilityHint={t('pin.hint', { count: PIN_LENGTH })}
          accessibilityState={{ disabled: locked }}
        />
        {checking ? (
          <ActivityIndicator
            style={styles.spinner}
            color={vaultColors.accent}
          />
        ) : null}
      </View>

      {locked ? (
        <View
          style={styles.lockedBox}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.lockedIcon}>⏳</Text>
          <Text style={styles.lockedText}>
            {t('pin.tooManyAttempts')}
            {'\n'}
            <Trans
              t={t}
              i18nKey="pin.tryAgainIn"
              values={{ time: `${minutes}:${seconds}` }}
              components={{ countdown: <Text style={styles.countdown} /> }}
            />
          </Text>
        </View>
      ) : error ? (
        <Text
          style={styles.error}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((_c, theme) => {
  const v = vaultPalette(theme);
  return {
    container: {
      gap: 10,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
      color: v.text,
    },
    input: {
      paddingVertical: 14,
      fontSize: 28,
      letterSpacing: 16,
      textAlign: 'center',
      color: v.text,
      borderWidth: 2,
      borderRadius: 12,
      borderColor: v.border,
      backgroundColor: v.surface,
    },
    inputLocked: {
      opacity: 0.4,
    },
    spinner: {
      position: 'absolute',
      right: 16,
      top: 0,
      bottom: 0,
    },
    error: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      color: v.danger,
    },
    lockedBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 10,
      backgroundColor: v.lockedBackground,
    },
    lockedIcon: {
      fontSize: 24,
    },
    lockedText: {
      flex: 1,
      fontSize: 14,
      color: v.lockedText,
    },
    countdown: {
      fontWeight: '800',
      fontVariant: ['tabular-nums'],
      color: v.countdown,
    },
  };
});
