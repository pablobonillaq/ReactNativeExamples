import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createLogger } from '../../observability/logger';
import { makeStyles } from '../../theme';
import {
  ComponentsDemo,
  ConsoleDemo,
  DebuggerDemo,
  NetworkDemo,
  PerformanceDemo,
  ProfilerDemo,
  StorageDemo,
} from './flipperDemos';
import { DemoCard, Note, Section, Steps } from './flipperUi';

const log = createLogger('FlipperScreen');

/**
 * Every Flipper plugin React Native used, and what replaces it today. Texts
 * are in the 'flipper' namespace: `migration.rows.<id>.plugin` / `.now`.
 */
const MIGRATION = [
  'logs',
  'network',
  'layout',
  'reactDevTools',
  'hermesDebugger',
  'performance',
  'crashReporter',
  'storage',
  'databases',
  'images',
  'redux',
] as const;

/**
 * Flipper used to be React Native's debugging app. It was removed from new
 * projects in React Native 0.74; React Native DevTools replaces it. This
 * screen explains the change and lets you try each replacement live.
 */
export function FlipperScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { t } = useTranslation('flipper');

  useEffect(() => {
    log.info('Flipper / DevTools screen opened');
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
          api="Desktop app + native SDK inside the app"
          description={t('about.description')}
        >
          <Text style={styles.paragraph}>
            <Trans
              t={t}
              i18nKey="about.removed"
              components={{ b: <Text style={styles.bold} /> }}
            />
          </Text>
          <Text style={styles.paragraph}>
            <Trans
              t={t}
              i18nKey="about.replacement"
              components={{ b: <Text style={styles.bold} /> }}
            />
          </Text>
        </DemoCard>
      </Section>

      <Section title={t('open.section')} subtitle={t('open.subtitle')}>
        <DemoCard
          title={t('open.title')}
          api="Metro: j · Dev Menu: Ctrl+M → Open DevTools"
        >
          <Steps
            steps={[
              t('open.steps.run'),
              t('open.steps.press'),
              t('open.steps.tabs'),
            ]}
          />
          <Note>{t('open.note')}</Note>
        </DemoCard>
      </Section>

      <Section title={t('try.section')} subtitle={t('try.subtitle')}>
        <ConsoleDemo />
        <NetworkDemo />
        <ComponentsDemo />
        <ProfilerDemo />
        <PerformanceDemo />
        <DebuggerDemo />
        <StorageDemo />
      </Section>

      <Section
        title={t('migration.section')}
        subtitle={t('migration.subtitle')}
      >
        <View style={styles.table}>
          {MIGRATION.map(id => (
            <View key={id} style={styles.tableRow}>
              <Text style={styles.plugin}>
                {t(`migration.rows.${id}.plugin`)}
              </Text>
              <Text style={styles.now}>{t(`migration.rows.${id}.now`)}</Text>
            </View>
          ))}
        </View>
        <Note>{t('migration.note')}</Note>
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
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: c.text,
  },
  bold: {
    fontWeight: '700',
  },
  table: {
    backgroundColor: c.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 8,
  },
  tableRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  plugin: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
  },
  now: {
    marginTop: 2,
    fontSize: 12,
    color: c.textMuted,
  },
}));
