import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { makeStyles } from '../../theme';
import type { ColorOption } from './personSchema';

/**
 * UI pieces shared by the Formik and React Hook Form screens so both
 * look exactly the same and only the form library differs.
 */

// Content colors: each swatch shows the color the option names, so they are
// the same in the light and dark themes.
const SWATCHES: Record<ColorOption, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#facc15',
};

export function ColorSwatch({ color }: { color: ColorOption }) {
  const styles = useStyles();
  return <View style={[styles.swatch, { backgroundColor: SWATCHES[color] }]} />;
}

export function SubmitButton({ onPress }: { onPress: () => void }) {
  const styles = useStyles();
  const { t } = useTranslation('forms');
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.buttonText}>{t('person.submit')}</Text>
    </Pressable>
  );
}

export function yearsAgo(years: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
}

/** Screen styles shared by both form screens: `const styles = useFormScreenStyles();`. */
export const useFormScreenStyles = makeStyles(c => ({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    gap: 16,
  },
}));

const useStyles = makeStyles(c => ({
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    marginTop: 8,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: c.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: c.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
}));
