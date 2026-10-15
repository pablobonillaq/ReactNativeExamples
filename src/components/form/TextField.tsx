import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { ErrorText, hiddenFromScreenReaders } from './accessibility';
import { makeStyles, useTheme } from '../../theme';
import { useFormStyles } from './formStyles';

type Props = TextInputProps & {
  label: string;
  error?: string;
  ref?: Ref<TextInputInstance>;
  /** Emoji shown on the right side of the input, like the date field. */
  icon?: string;
  /** Extra style for the label (e.g. light text on dark screens). */
  labelStyle?: StyleProp<TextStyle>;
};

/** Text input with label and error. Shows a character counter when maxLength is set on a multiline input. */
export function TextField({
  label,
  error,
  ref,
  icon,
  style,
  labelStyle,
  ...inputProps
}: Props) {
  const { multiline, maxLength, value } = inputProps;
  const showCounter = multiline && maxLength !== undefined;
  const formStyles = useFormStyles();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation('forms');

  return (
    <View style={formStyles.field}>
      {/* The input announces its own label, so the visible one is hidden
          from screen readers to avoid reading it twice. */}
      <Text style={[formStyles.label, labelStyle]} {...hiddenFromScreenReaders}>
        {label}
      </Text>
      <View>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          style={[
            formStyles.input,
            multiline && styles.multiline,
            icon ? styles.withIcon : null,
            error ? formStyles.inputError : null,
            style,
          ]}
          placeholderTextColor={colors.placeholder}
          textAlignVertical={multiline ? 'top' : undefined}
          {...inputProps}
        />
        {icon ? (
          // pointerEvents="none" so tapping the icon still focuses the input
          <View
            style={styles.iconContainer}
            pointerEvents="none"
            {...hiddenFromScreenReaders}
          >
            <Text style={formStyles.icon}>{icon}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.footer}>
        {error ? <ErrorText message={error} /> : <View />}
        {showCounter ? (
          <Text
            style={styles.counter}
            accessibilityLabel={t('textField.counterA11y', {
              length: value?.length ?? 0,
              max: maxLength,
            })}
          >
            {value?.length ?? 0}/{maxLength}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles(c => ({
  multiline: {
    minHeight: 120,
  },
  withIcon: {
    paddingRight: 48,
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 14,
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  counter: {
    marginTop: 4,
    fontSize: 12,
    color: c.textMuted,
  },
}));
