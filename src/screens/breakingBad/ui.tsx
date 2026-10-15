import { Text } from 'react-native';
import { makeStyles, useTheme, type NamedStyles } from '../../theme';
import type { Series } from './breakingBadApi';

export type BreakingBadColors = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  /** Breaking Bad green: selected filter, buttons, section titles. */
  accent: string;
  /** Text on top of `accent`. */
  onAccent: string;
  /** Better Call Saul yellow (series badge). */
  saul: string;
  /** Text on top of `saul`. */
  onSaul: string;
  /** Errors, deaths. */
  danger: string;
  /** Behind character images while they load. */
  imagePlaceholder: string;
  /** "Deceased" pill on top of the character image. */
  deceasedBackground: string;
  deceasedText: string;
};

// The show's branded palette. Dark is the original look; light keeps the
// same green / yellow accents on light green-tinted surfaces.
const DARK: BreakingBadColors = {
  background: '#0b1a12',
  surface: '#13261b',
  text: '#f3f4f6',
  muted: '#9ca3af',
  accent: '#4ade80',
  onAccent: '#0b1a12',
  saul: '#facc15',
  onSaul: '#0b1a12',
  danger: '#f87171',
  imagePlaceholder: '#1f2937',
  deceasedBackground: 'rgba(0,0,0,0.75)',
  deceasedText: '#f87171',
};

const LIGHT: BreakingBadColors = {
  background: '#eef6f0',
  surface: '#ffffff',
  text: '#0b1a12',
  muted: '#4b5f53',
  accent: '#15803d',
  onAccent: '#ffffff',
  saul: '#facc15',
  onSaul: '#0b1a12',
  danger: '#dc2626',
  imagePlaceholder: '#d5e4d9',
  deceasedBackground: 'rgba(255,255,255,0.9)',
  deceasedText: '#dc2626',
};

/** Breaking Bad palette for the current light / dark theme. */
export function useBreakingBadColors(): BreakingBadColors {
  return useTheme().isDark ? DARK : LIGHT;
}

/**
 * Themed styles with the Breaking Bad palette:
 *   const useStyles = makeBreakingBadStyles(bb => ({ ... }));
 */
export function makeBreakingBadStyles<T extends NamedStyles<T>>(
  factory: (bb: BreakingBadColors) => T,
) {
  return makeStyles<T>((_c, theme) => factory(theme.isDark ? DARK : LIGHT));
}

export function SeriesBadge({ series }: { series: Series }) {
  const styles = useStyles();
  const isSaul = series === 'Better Call Saul';
  return (
    <Text
      style={[styles.badge, isSaul ? styles.saul : styles.breakingBad]}
      numberOfLines={1}
    >
      {isSaul ? 'Better Call Saul' : 'Breaking Bad'}
    </Text>
  );
}

const useStyles = makeBreakingBadStyles(bb => ({
  badge: {
    flexShrink: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    fontSize: 10,
    fontWeight: '700',
  },
  breakingBad: {
    color: bb.onAccent,
    backgroundColor: bb.accent,
  },
  saul: {
    color: bb.onSaul,
    backgroundColor: bb.saul,
  },
}));
