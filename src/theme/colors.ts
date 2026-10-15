/**
 * Semantic color tokens for the light and dark themes.
 *
 * Components never use hex values directly: they read these tokens through
 * `useTheme()` or `makeStyles()` (src/theme), so every screen follows the
 * light / dark setting. Pick a token by its role (background, text, border…),
 * not by how it looks.
 */
export type ThemeColors = {
  // ---------- Surfaces ----------
  /** Screen background (behind cards). */
  background: string;
  /** Cards, sheets, list rows, inputs. */
  surface: string;
  /** Tinted panels: demo tracks, table headers, selected rows. */
  surfaceAlt: string;
  /** Neutral fills: secondary buttons, chips, progress tracks. */
  surfaceMuted: string;
  /** Hairlines and separators. */
  border: string;
  /** Input borders and stronger outlines. */
  borderStrong: string;

  // ---------- Text ----------
  /** Main text. */
  text: string;
  /** Labels and secondary text. */
  textSecondary: string;
  /** Hints, captions, disabled text. */
  textMuted: string;
  /** Placeholders and very low emphasis text. */
  placeholder: string;
  /** Text and icons on top of `primary` / status colors. */
  textOnPrimary: string;

  // ---------- Brand and status ----------
  primary: string;
  /** Soft primary background (selected chip, highlight). */
  primarySoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;

  // ---------- Demo accents (boxes, charts, series) ----------
  pink: string;
  green: string;
  amber: string;
  sky: string;
  purple: string;

  // ---------- Misc ----------
  /** Monospace / code background. */
  codeBackground: string;
  /** Code text. */
  codeText: string;
  /** Flash used to highlight something that just changed. */
  highlight: string;
  /** Dim layer behind modals and sheets. */
  overlay: string;
  /** Shadow color (iOS). */
  shadow: string;
};

export const lightColors: ThemeColors = {
  background: '#f3f4f6',
  surface: '#ffffff',
  surfaceAlt: '#eef2ff',
  surfaceMuted: '#e5e7eb',
  border: '#e5e7eb',
  borderStrong: '#d1d5db',

  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  placeholder: '#9ca3af',
  textOnPrimary: '#ffffff',

  primary: '#4f46e5',
  primarySoft: '#e0e7ff',
  success: '#16a34a',
  successSoft: '#dcfce7',
  warning: '#d97706',
  warningSoft: '#fef3c7',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',
  info: '#0284c7',
  infoSoft: '#e0f2fe',

  pink: '#db2777',
  green: '#059669',
  amber: '#d97706',
  sky: '#0284c7',
  purple: '#7c3aed',

  codeBackground: '#f1f5f9',
  codeText: '#1e1b4b',
  highlight: '#fde047',
  overlay: 'rgba(0, 0, 0, 0.4)',
  shadow: '#000000',
};

export const darkColors: ThemeColors = {
  background: '#0b1120',
  surface: '#161f31',
  surfaceAlt: '#1e2540',
  surfaceMuted: '#273248',
  border: '#273248',
  borderStrong: '#3b4760',

  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  placeholder: '#64748b',
  // Primary and status colors are light in dark mode: dark text reads better.
  textOnPrimary: '#0b1120',

  primary: '#818cf8',
  primarySoft: '#312e81',
  success: '#4ade80',
  successSoft: '#14532d',
  warning: '#fbbf24',
  warningSoft: '#78350f',
  danger: '#f87171',
  dangerSoft: '#7f1d1d',
  info: '#38bdf8',
  infoSoft: '#0c4a6e',

  pink: '#f472b6',
  green: '#34d399',
  amber: '#fbbf24',
  sky: '#38bdf8',
  purple: '#a78bfa',

  codeBackground: '#0f172a',
  codeText: '#c7d2fe',
  highlight: '#a16207',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
};
