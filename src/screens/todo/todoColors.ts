import { useMemo } from 'react';
import { useTheme, type ThemeColors } from '../../theme';

/** Mixes two `#rrggbb` colors: t = 0 gives `from`, t = 1 gives `to`. */
function mix(from: string, to: string, t: number) {
  const channel = (hex: string, i: number) =>
    parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2]
    .map(i =>
      Math.round(channel(from, i) + (channel(to, i) - channel(from, i)) * t)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

// How much `primary` goes into each shade (the rest is `surface`). Light:
// pale to strong indigo. Dark: kept darker so the light label text reads.
const LIGHT_STEPS = [0.3, 0.5, 0.7, 0.85, 1];
const DARK_STEPS = [0.2, 0.3, 0.4, 0.5, 0.6];

function generationColors(colors: ThemeColors, isDark: boolean) {
  return (isDark ? DARK_STEPS : LIGHT_STEPS).map(step =>
    mix(colors.surface, colors.primary, step),
  );
}

/**
 * One color per generation, from outermost to innermost, derived from the
 * theme's `primary` and `surface` tokens. Labels on top of them use
 * `codeText` (dark in light mode, light in dark mode).
 */
export function useGenerationColors(): string[] {
  const { colors, isDark } = useTheme();
  return useMemo(() => generationColors(colors, isDark), [colors, isDark]);
}
