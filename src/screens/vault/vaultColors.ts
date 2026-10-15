import { useTheme, type Theme } from '../../theme';

/**
 * "Vault" palette for the password manager screens: a branded, steel-blue
 * look that is darker / more serious than the rest of the app. It has a
 * dark variant (the original palette) and a light one with the same feel.
 *
 * Components read it with `useVaultColors()`, or inside
 * `makeStyles((c, theme) => { const v = vaultPalette(theme); ... })`.
 */
export type VaultColors = {
  background: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  /** Text on top of `accent`. */
  accentText: string;
  danger: string;
  success: string;
  /** "Too many attempts" box. */
  lockedBackground: string;
  lockedText: string;
  /** Countdown inside the "too many attempts" box. */
  countdown: string;
  /** Dim layer behind the PIN modal. */
  overlay: string;
  /** Navigation header. */
  headerBackground: string;
  headerTint: string;
};

const darkVault: VaultColors = {
  background: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  text: '#f1f5f9',
  muted: '#94a3b8',
  accent: '#38bdf8',
  accentText: '#0c1a2b',
  danger: '#f87171',
  success: '#4ade80',
  lockedBackground: '#3b1d1d',
  lockedText: '#fecaca',
  countdown: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.6)',
  headerBackground: '#1e293b',
  headerTint: '#f1f5f9',
};

const lightVault: VaultColors = {
  background: '#e2e8f0',
  surface: '#f8fafc',
  border: '#cbd5e1',
  text: '#0f172a',
  muted: '#475569',
  accent: '#0369a1',
  accentText: '#ffffff',
  danger: '#b91c1c',
  success: '#15803d',
  lockedBackground: '#fee2e2',
  lockedText: '#7f1d1d',
  countdown: '#450a0a',
  overlay: 'rgba(15, 23, 42, 0.5)',
  headerBackground: '#cbd5e1',
  headerTint: '#0f172a',
};

/** Vault palette for a theme (for use inside makeStyles factories). */
export function vaultPalette(theme: Theme): VaultColors {
  return theme.isDark ? darkVault : lightVault;
}

/** Vault palette for the current light / dark theme. */
export function useVaultColors(): VaultColors {
  return vaultPalette(useTheme());
}
