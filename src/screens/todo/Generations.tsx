import type { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import type en from '../../i18n/locales/en/todo';
import { makeStyles } from '../../theme';
import { useGenerationColors } from './todoColors';

/** Which note (in the `todo` namespace) says how the list reads the store. */
export type GenerationsNote = keyof (typeof en)['generations']['notes'];

/**
 * Five nested components. None of them receives props: each one just renders
 * the next. Without a shared store (Context or Redux), `todos` and every
 * callback (toggle, edit, remove...) would have to be passed down through all
 * of them ("prop drilling") only so the last one could use them. Here only
 * the list inside Generation5 reads them, straight from the store.
 *
 * Created once at module level with the list to render at the bottom and the
 * key of a note that says how that list reads the store (translated at render).
 */
export function createGenerations(
  List: ComponentType,
  listNote: GenerationsNote,
) {
  function Generation5() {
    return (
      <Frame level={5} note={listNote}>
        <List />
      </Frame>
    );
  }

  function Generation4() {
    return (
      <Frame level={4}>
        <Generation5 />
      </Frame>
    );
  }

  function Generation3() {
    return (
      <Frame level={3}>
        <Generation4 />
      </Frame>
    );
  }

  function Generation2() {
    return (
      <Frame level={2}>
        <Generation3 />
      </Frame>
    );
  }

  return function Generation1() {
    return (
      <Frame level={1}>
        <Generation2 />
      </Frame>
    );
  };
}

/** Colored box that makes the nesting visible on screen. */
function Frame({
  level,
  note,
  children,
}: {
  level: number;
  note?: GenerationsNote;
  children: ReactNode;
}) {
  const { t } = useTranslation('todo');
  const styles = useStyles();
  const generationColors = useGenerationColors();
  const color = generationColors[level - 1];
  return (
    <View style={[styles.frame, { borderColor: color }]}>
      <Text style={[styles.label, { backgroundColor: color }]}>
        {t('generations.label', {
          level,
          note: note
            ? t(`generations.notes.${note}`)
            : t('generations.noProps'),
        })}
      </Text>
      {children}
    </View>
  );
}

const useStyles = makeStyles(c => ({
  frame: {
    gap: 6,
    padding: 4,
    borderWidth: 2,
    borderRadius: 10,
  },
  label: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    fontSize: 10,
    fontWeight: '700',
    color: c.codeText,
  },
}));
