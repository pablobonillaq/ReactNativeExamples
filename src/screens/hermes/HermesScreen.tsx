import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createLogger } from '../../observability/logger';
import { makeStyles } from '../../theme';
import { DemoCard, Note, Section, Steps } from '../flipper/flipperUi';
import {
  BenchmarkDemo,
  BytecodeDemo,
  DebuggingDemo,
  EngineInfoDemo,
  EventLoopDemo,
  FeaturesDemo,
  IntlDemo,
  MemoryDemo,
} from './hermesDemos';
import { getRuntimeProperties, isHermes } from './hermesRuntime';

const log = createLogger('Hermes');

/**
 * Hermes vs a JIT engine like JavaScriptCore / V8. Texts are in the 'hermes'
 * namespace: `comparison.rows.<id>.topic` / `.hermes` / `.jit`.
 */
const COMPARISON = [
  'compiled',
  'startup',
  'memory',
  'peakCpu',
  'appSize',
  'debugging',
] as const;

/**
 * Hermes is the JavaScript engine React Native uses by default: it runs the
 * app's JS on the device. This screen explains how it works and measures it
 * live.
 */
export function HermesScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { t } = useTranslation('hermes');

  useEffect(() => {
    log.info('Hermes screen opened', {
      hermes: isHermes(),
      version: getRuntimeProperties()?.['OSS Release Version'],
    });
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Section title={t('about.section')}>
        <DemoCard
          title={t('about.title')}
          api="Your JS → Babel → Metro bundle → Hermes"
          description={t('about.description')}
        >
          <Steps
            steps={[
              t('about.steps.bundle'),
              t('about.steps.compile'),
              t('about.steps.launch'),
              t('about.steps.jsi'),
            ]}
          />
        </DemoCard>
      </Section>

      <Section
        title={t('sections.device')}
        subtitle={t('sections.deviceSubtitle')}
      >
        <EngineInfoDemo />
      </Section>

      <Section title={t('sections.howItWorks')}>
        <BytecodeDemo />
        <MemoryDemo />
        <EventLoopDemo />
      </Section>

      <Section title={t('sections.supports')}>
        <FeaturesDemo />
        <IntlDemo />
      </Section>

      <Section title={t('sections.performance')}>
        <BenchmarkDemo />
        <DebuggingDemo />
      </Section>

      <Section
        title={t('comparison.section')}
        subtitle={t('comparison.subtitle')}
      >
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.header]} />
            <Text style={[styles.cell, styles.header]}>
              {t('comparison.hermes')}
            </Text>
            <Text style={[styles.cell, styles.header]}>
              {t('comparison.jit')}
            </Text>
          </View>
          {COMPARISON.map(id => (
            <View key={id} style={styles.row}>
              <Text style={[styles.cell, styles.topic]}>
                {t(`comparison.rows.${id}.topic`)}
              </Text>
              <Text style={styles.cell}>
                {t(`comparison.rows.${id}.hermes`)}
              </Text>
              <Text style={styles.cell}>{t(`comparison.rows.${id}.jit`)}</Text>
            </View>
          ))}
        </View>
        <Note>{t('comparison.note')}</Note>
      </Section>
    </ScrollView>
  );
}

const useStyles = makeStyles(c => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    padding: 16,
  },
  table: {
    backgroundColor: c.surface,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  headerRow: {
    backgroundColor: c.surfaceAlt,
  },
  cell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    color: c.text,
  },
  header: {
    fontWeight: '700',
    color: c.primary,
  },
  topic: {
    fontWeight: '700',
  },
}));
