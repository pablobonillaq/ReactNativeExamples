import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Text, View, useAnimatedValue } from 'react-native';
import { makeStyles, useTheme } from '../../theme';

/**
 * Render counting for the demos.
 *
 * Counts live in a module-level Map (not in state or a ref) so that counting
 * never causes a render by itself and works the same in every component.
 * It's a teaching tool: mutating something during render isn't something to
 * do in real app code.
 */
const counts = new Map<string, number>();

export function useRenderCount(id: string) {
  const next = (counts.get(id) ?? 0) + 1;
  counts.set(id, next);
  return next;
}

/** Forget every count (called when the screen closes). */
export function resetRenderCounts() {
  counts.clear();
}

/**
 * Shows how many times the component that renders it has rendered, and
 * flashes (theme `highlight`) on every render.
 */
export function RenderBadge({ id, label }: { id: string; label: string }) {
  const count = useRenderCount(id);
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation('rerenders');
  const flash = useAnimatedValue(0);

  // No dependency array: runs after every render of this badge.
  useEffect(() => {
    flash.setValue(1);
    Animated.timing(flash, {
      toValue: 0,
      duration: 700,
      useNativeDriver: false,
    }).start();
  });

  const backgroundColor = flash.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceMuted, colors.highlight],
  });

  return (
    <Animated.View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      {/* The count stays the first child: tests read it as a number. */}
      <Text style={styles.count} testID={`renders:${id}`}>
        {count} {t('render', { count })}
      </Text>
    </Animated.View>
  );
}

/** Two columns: the naive version and the optimized one. */
export function Comparison({
  without,
  withIt,
  withLabel,
}: {
  without: ReactNode;
  withIt: ReactNode;
  /** e.g. "With React.memo" */
  withLabel: string;
}) {
  const styles = useStyles();
  const { t } = useTranslation('rerenders');
  return (
    <View style={styles.columns}>
      <View style={[styles.column, styles.bad]}>
        <Text style={[styles.columnTitle, styles.badTitle]}>
          {t('without')}
        </Text>
        {without}
      </View>
      <View style={[styles.column, styles.good]}>
        <Text style={[styles.columnTitle, styles.goodTitle]}>{withLabel}</Text>
        {withIt}
      </View>
    </View>
  );
}

const useStyles = makeStyles(c => ({
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: c.text,
  },
  count: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: c.textMuted,
  },
  columns: {
    flexDirection: 'row',
    gap: 8,
  },
  column: {
    flex: 1,
    gap: 6,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  bad: {
    borderColor: c.dangerSoft,
    backgroundColor: c.surface,
  },
  good: {
    borderColor: c.successSoft,
    backgroundColor: c.surface,
  },
  columnTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  badTitle: {
    color: c.danger,
  },
  goodTitle: {
    color: c.green,
  },
}));
