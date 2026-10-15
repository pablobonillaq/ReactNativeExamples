import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { makeStyles } from '../../theme';

export { Button, DemoCard, Note, Row, Section } from '../animated/ui';

/** "Flipper plugin → what to use today" banner at the top of a card. */
export function Replacement({
  flipper,
  today,
}: {
  flipper: string;
  today: string;
}) {
  const styles = useStyles();
  const { t } = useTranslation('flipper');
  return (
    <View style={styles.replacement}>
      <Text style={styles.old}>
        {t('ui.replacementFlipper', { plugin: flipper })}
      </Text>
      <Text style={styles.arrow}>→</Text>
      <Text style={styles.now}>{today}</Text>
    </View>
  );
}

/**
 * Numbered "how to see it" instructions (already translated). Text between
 * `backticks` is shown as code.
 */
export function Steps({ steps }: { steps: string[] }) {
  const styles = useStyles();
  return (
    <View style={styles.steps}>
      {steps.map((step, i) => (
        <View key={i} style={styles.step}>
          <Text style={styles.stepNumber}>{i + 1}</Text>
          <Text style={styles.stepText}>
            {step.split('`').map((part, j) =>
              // Odd parts were inside backticks.
              j % 2 === 1 ? <Code key={j}>{part}</Code> : part,
            )}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Monospace text, for keys, commands and code. */
export function Code({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.code}>{children}</Text>;
}

/** Result of the last demo action. */
export function Result({ children }: { children: ReactNode }) {
  const styles = useStyles();
  if (!children) {
    return null;
  }
  return (
    <View style={styles.result}>
      <Text style={styles.resultText}>{children}</Text>
    </View>
  );
}

const useStyles = makeStyles(c => ({
  replacement: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  old: {
    fontSize: 12,
    color: c.textMuted,
    textDecorationLine: 'line-through',
  },
  arrow: {
    fontSize: 12,
    color: c.textMuted,
  },
  now: {
    fontSize: 12,
    fontWeight: '700',
    color: c.green,
  },
  steps: {
    gap: 6,
  },
  step: {
    flexDirection: 'row',
    gap: 8,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: c.textOnPrimary,
    backgroundColor: c.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: c.text,
  },
  code: {
    fontFamily: 'monospace',
    color: c.pink,
  },
  result: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: c.codeBackground,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: c.text,
  },
}));
