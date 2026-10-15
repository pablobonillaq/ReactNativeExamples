import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { makeStyles } from '../../theme';
import { vaultPalette } from './vaultColors';

/** Small building blocks shared by the vault screens. */

export function VaultButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  accessibilityHint?: string;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.dangerButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant !== 'primary' && styles.buttonTextAlt,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Card({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <View style={styles.card}>{children}</View>;
}

export function Hero({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.hero}>
      <Text style={styles.heroIcon}>{icon}</Text>
      <Text style={styles.heroTitle} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
    </View>
  );
}

const useStyles = makeStyles((_c, theme) => {
  const v = vaultPalette(theme);
  return {
    button: {
      minHeight: 48,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: v.accent,
    },
    secondary: {
      borderWidth: 1,
      borderColor: v.border,
      backgroundColor: v.surface,
    },
    dangerButton: {
      backgroundColor: 'transparent',
    },
    disabled: {
      opacity: 0.4,
    },
    pressed: {
      opacity: 0.8,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '700',
      color: v.accentText,
    },
    buttonTextAlt: {
      color: v.text,
    },
    card: {
      gap: 14,
      padding: 16,
      borderRadius: 16,
      backgroundColor: v.surface,
    },
    hero: {
      alignItems: 'center',
      gap: 6,
      paddingVertical: 12,
    },
    heroIcon: {
      fontSize: 56,
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: '800',
      textAlign: 'center',
      color: v.text,
    },
    heroSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
      color: v.muted,
    },
  };
});
