import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import {
  Animated,
  Pressable,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { createLogger } from '../../observability/logger';
import { makeStyles, useTheme } from '../../theme';

/** Shared building blocks for the Animated API demos. */

const log = createLogger('AnimatedApi');

export const BOX = 44;

/** Style prop of Animated.View: accepts Animated values and interpolations. */
export type AnimatedViewStyle = ComponentProps<typeof Animated.View>['style'];

const SCREEN_PADDING = 16;
const CARD_PADDING = 14;

/** Usable width inside a card. */
export function useCardWidth() {
  const { width } = useWindowDimensions();
  return width - SCREEN_PADDING * 2 - CARD_PADDING * 2;
}

/** How far a box can travel horizontally inside a card. */
export function useTravel() {
  return Math.max(0, useCardWidth() - BOX);
}

/**
 * Starts an animation and logs it (logger → Metro, in-app viewer, Sentry
 * breadcrumbs). `finished` is false when it was interrupted by stop() or by
 * another animation on the same value.
 */
export function play(
  demo: string,
  animation: Animated.CompositeAnimation,
  onEnd?: (finished: boolean) => void,
) {
  log.debug('Animation started', { demo });
  animation.start(({ finished }) => {
    log.debug('Animation ended', { demo, finished });
    onEnd?.(finished);
  });
}

// ---------- Scroll lock (gestures inside a ScrollView) ----------

/**
 * While a box is being dragged the ScrollView must not scroll, otherwise it
 * steals the gesture. Gesture demos turn scrolling off on grant and back on
 * on release.
 */
export const ScrollLockContext = createContext<(enabled: boolean) => void>(
  () => {},
);

export function useSetScrollEnabled() {
  return useContext(ScrollLockContext);
}

// ---------- Layout ----------

export function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export function DemoCard({
  title,
  api,
  description,
  children,
}: {
  title: string;
  /** The API being shown, e.g. "Animated.timing(value, { ... })". */
  api: string;
  description?: string;
  children: ReactNode;
}) {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.api}>{api}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

/** Light lane the boxes move in. Clips what goes beyond its edges. */
export function Track({
  height = BOX + 12,
  label,
  children,
  style,
}: {
  height?: number;
  label?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();
  return (
    <View>
      {label ? <Text style={styles.trackLabel}>{label}</Text> : null}
      <View style={[styles.track, { height }, style]}>{children}</View>
    </View>
  );
}

/** A colored square (any Animated style can be passed). Defaults to primary. */
export function Box({
  color,
  label,
  style,
  size = BOX,
}: {
  color?: string;
  label?: string;
  size?: number;
  style?: AnimatedViewStyle;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Animated.View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          backgroundColor: color ?? colors.primary,
        },
        style,
      ]}
    >
      {label ? <Text style={styles.boxLabel}>{label}</Text> : null}
    </Animated.View>
  );
}

// ---------- Controls ----------

export function Button({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'secondary' && styles.buttonTextSecondary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Row({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <View style={styles.row}>{children}</View>;
}

/** Single-choice chips. */
export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.chips}>
      {options.map(option => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text
              style={[styles.chipText, selected && styles.chipTextSelected]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Shows the current number of an Animated.Value. Animated values don't
 * re-render React, so this subscribes with addListener / removeListener.
 */
export function ValueLabel({
  value,
  label = 'value',
  digits = 2,
}: {
  value: Animated.Value;
  label?: string;
  digits?: number;
}) {
  const styles = useStyles();
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const id = value.addListener(({ value: v }) => setCurrent(v));
    return () => value.removeListener(id);
  }, [value]);
  return (
    <Text style={styles.valueLabel}>
      {label} = {current.toFixed(digits)}
    </Text>
  );
}

export function Note({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.note}>{children}</Text>;
}

const useStyles = makeStyles((c, theme) => ({
  section: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: c.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: c.textMuted,
    marginBottom: 10,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: 14,
    padding: CARD_PADDING,
    marginBottom: 12,
    shadowColor: c.shadow,
    shadowOpacity: theme.isDark ? 0 : 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: theme.isDark ? 0 : 1,
    borderWidth: theme.isDark ? 1 : 0,
    borderColor: c.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
  },
  api: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'monospace',
    color: c.primary,
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    color: c.textMuted,
  },
  cardBody: {
    marginTop: 12,
    gap: 10,
  },
  track: {
    backgroundColor: c.surfaceAlt,
    borderRadius: 10,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trackLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: c.textMuted,
    marginBottom: 4,
  },
  box: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxLabel: {
    color: c.textOnPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: c.primary,
  },
  buttonSecondary: {
    backgroundColor: c.primarySoft,
  },
  buttonDanger: {
    backgroundColor: c.danger,
  },
  buttonText: {
    color: c.textOnPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  buttonTextSecondary: {
    color: c.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: c.surfaceMuted,
  },
  chipSelected: {
    backgroundColor: c.primary,
  },
  chipText: {
    fontSize: 12,
    color: c.textSecondary,
  },
  chipTextSelected: {
    color: c.textOnPrimary,
  },
  valueLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: c.text,
  },
  note: {
    fontSize: 12,
    color: c.textMuted,
    fontStyle: 'italic',
  },
}));
