import { useHeaderHeight } from '@react-navigation/elements';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles } from '../../theme';

/** Layout shared by the Context and Redux todo screens. */
export function TodoScreenLayout({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const styles = useStyles();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.caption}>{caption}</Text>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles(c => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    padding: 12,
    gap: 12,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600',
    color: c.primary,
  },
}));
