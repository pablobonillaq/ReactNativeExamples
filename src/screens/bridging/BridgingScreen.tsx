import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createLogger } from '../../observability/logger';
import { makeStyles } from '../../theme';
import { DemoCard, Note, Section, Steps } from '../flipper/flipperUi';
import { getBridge } from './bridgeModule';
import {
  AsyncCallDemo,
  BenchmarkDemo,
  CallbackDemo,
  ErrorsDemo,
  EventsDemo,
  SyncCallDemo,
  TypesDemo,
} from './bridgingDemos';

const log = createLogger('Bridging');

/** Rows of "The old bridge vs JSI" table; texts in comparison.rows.<id>. */
const COMPARISON = [
  'travel',
  'sync',
  'types',
  'loading',
  'views',
  'reactNative',
] as const;

/** Other ways to cross between JS and native; texts in otherKinds.<id>. */
const OTHER_KINDS = [
  'nativeUi',
  'legacy',
  'cxx',
  'nitro',
  'expo',
  'hostFunctions',
] as const;

/**
 * How JavaScript and native code talk to each other, with a live Turbo
 * Native Module (specs/NativeBridgeDemo.ts) written in Kotlin and
 * Objective-C++.
 */
export function BridgingScreen() {
  const insets = useSafeAreaInsets();
  const available = getBridge() !== null;
  const styles = useStyles();
  const { t } = useTranslation('bridging');

  useEffect(() => {
    log.info('Bridging screen opened', { nativeModule: available });
  }, [available]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Section title={t('sections.what')}>
        <DemoCard
          title={t('intro.title')}
          api="JS (Hermes) ⇄ JSI ⇄ C++ ⇄ Kotlin / Objective-C"
          description={t('intro.description')}
        >
          <Steps
            steps={[
              t('intro.steps.spec'),
              t('intro.steps.codegen'),
              t('intro.steps.implement'),
              t('intro.steps.use'),
            ]}
          />
        </DemoCard>
        <View style={[styles.status, !available && styles.statusMissing]}>
          <Text style={styles.statusText}>
            {available
              ? t('status.loaded', { os: Platform.OS })
              : t('status.missing')}
          </Text>
        </View>
      </Section>

      <Section
        title={t('sections.oldVsJsi')}
        subtitle={t('sections.oldVsJsiSubtitle')}
      >
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.header]} />
            <Text style={[styles.cell, styles.header]}>
              {t('comparison.oldBridge')}
            </Text>
            <Text style={[styles.cell, styles.header]}>
              {t('comparison.newArchitecture')}
            </Text>
          </View>
          {COMPARISON.map(id => (
            <View key={id} style={styles.row}>
              <Text style={[styles.cell, styles.topic]}>
                {t(`comparison.rows.${id}.topic`)}
              </Text>
              <Text style={styles.cell}>
                {t(`comparison.rows.${id}.bridge`)}
              </Text>
              <Text style={styles.cell}>{t(`comparison.rows.${id}.jsi`)}</Text>
            </View>
          ))}
        </View>
        <Note>{t('comparison.note')}</Note>
      </Section>

      <Section
        title={t('sections.jsToNative')}
        subtitle={t('sections.jsToNativeSubtitle')}
      >
        <SyncCallDemo />
        <AsyncCallDemo />
        <CallbackDemo />
      </Section>

      <Section
        title={t('sections.nativeToJs')}
        subtitle={t('sections.nativeToJsSubtitle')}
      >
        <EventsDemo />
      </Section>

      <Section title={t('sections.data')} subtitle={t('sections.dataSubtitle')}>
        <TypesDemo />
        <ErrorsDemo />
      </Section>

      <Section title={t('sections.performance')}>
        <BenchmarkDemo />
      </Section>

      <Section title={t('sections.otherKinds')}>
        <View style={styles.table}>
          {OTHER_KINDS.map(id => (
            <View key={id} style={styles.kind}>
              <Text style={styles.kindTitle}>
                {t(`otherKinds.${id}.title`)}
              </Text>
              <Text style={styles.kindText}>
                {t(`otherKinds.${id}.description`)}
              </Text>
            </View>
          ))}
        </View>
        <Note>{t('otherKinds.note')}</Note>
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
  status: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: c.successSoft,
  },
  statusMissing: {
    backgroundColor: c.warningSoft,
  },
  statusText: {
    fontSize: 13,
    color: c.text,
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
  kind: {
    gap: 2,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  kindTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: c.primary,
  },
  kindText: {
    fontSize: 12,
    color: c.text,
  },
}));
