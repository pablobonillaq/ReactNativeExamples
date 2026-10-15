import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createLogger } from '../../observability/logger';
import { makeStyles } from '../../theme';
import { DemoCard, Note, Section } from '../animated/ui';
import { Steps } from '../flipper/flipperUi';
import {
  ReactMemoDemo,
  UseCallbackDemo,
  UseMemoCalculationDemo,
  UseMemoObjectDemo,
  UseRefCounterDemo,
  UseRefInputDemo,
} from './rerenderDemos';
import { resetRenderCounts } from './renderTracking';

const log = createLogger('Rerenders');

/** Tools in the "When to use each one" table; texts in rules.<id>. */
const RULES: { id: string; tool?: string }[] = [
  { id: 'reactMemo', tool: 'React.memo' },
  { id: 'useCallback', tool: 'useCallback' },
  { id: 'useMemo', tool: 'useMemo' },
  { id: 'useRef', tool: 'useRef' },
  // No tool name: shown as rules.noneTool.
  { id: 'none' },
];

/**
 * Side-by-side demos of the four tools React offers to avoid unnecessary
 * renders. Every box counts its renders and flashes yellow when it renders.
 */
export function RerendersScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { t } = useTranslation('rerenders');

  useEffect(() => {
    log.info('Re-renders screen opened');
    return resetRenderCounts;
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Section title={t('sections.why')}>
        <DemoCard
          title={t('intro.title')}
          api="state change · parent render · context change"
          description={t('intro.description')}
        >
          <Steps
            steps={[
              t('intro.steps.badges'),
              t('intro.steps.columns'),
              t('intro.steps.devTools'),
            ]}
          />
        </DemoCard>
      </Section>

      <Section title="React.memo" subtitle={t('sections.memoSubtitle')}>
        <ReactMemoDemo />
      </Section>

      <Section title="useCallback" subtitle={t('sections.useCallbackSubtitle')}>
        <UseCallbackDemo />
      </Section>

      <Section title="useMemo" subtitle={t('sections.useMemoSubtitle')}>
        <UseMemoCalculationDemo />
        <UseMemoObjectDemo />
      </Section>

      <Section title="useRef" subtitle={t('sections.useRefSubtitle')}>
        <UseRefCounterDemo />
        <UseRefInputDemo />
      </Section>

      <Section title={t('sections.whenToUse')}>
        <View style={styles.table}>
          {RULES.map(({ id, tool }) => (
            <View key={id} style={styles.row}>
              <Text style={styles.tool}>{tool ?? t('rules.noneTool')}</Text>
              <Text style={styles.when}>{t(`rules.${id}`)}</Text>
            </View>
          ))}
        </View>
        <Note>{t('compilerNote')}</Note>
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 8,
  },
  row: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  tool: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: c.primary,
  },
  when: {
    marginTop: 2,
    fontSize: 12,
    color: c.text,
  },
}));
