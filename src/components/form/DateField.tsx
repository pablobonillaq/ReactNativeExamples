import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { currentLocale } from '../../i18n';
import { makeStyles, useTheme } from '../../theme';
import { ErrorText, hiddenFromScreenReaders } from './accessibility';
import { useFormStyles } from './formStyles';

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  /** Called when the calendar is closed without picking a date. */
  onDismiss?: () => void;
  error?: string;
  placeholder?: string;
  /** Date the calendar opens on when there is no value yet. */
  defaultDate?: Date;
  maximumDate?: Date;
  /** Read by VoiceOver / TalkBack. Defaults to `label`. */
  accessibilityLabel?: string;
  /** Explains what happens when the field is activated. */
  accessibilityHint?: string;
};

/**
 * Opens a native date picker with day / month / year wheels ("spinner"),
 * so the year can be changed directly instead of paging month by month:
 * - Android: the system date dialog (imperative API).
 * - iOS: the wheels inside a bottom sheet with a "Done" button.
 */
export function DateField({
  label,
  value,
  onChange,
  onDismiss,
  error,
  placeholder,
  defaultDate = new Date(),
  maximumDate,
  accessibilityLabel = label,
  accessibilityHint,
}: Props) {
  const formStyles = useFormStyles();
  const styles = useStyles();
  const { isDark } = useTheme();
  const { t } = useTranslation('forms');
  const [iosVisible, setIosVisible] = useState(false);
  const [iosDraft, setIosDraft] = useState<Date>(value ?? defaultDate);

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: value ?? defaultDate,
        mode: 'date',
        display: 'spinner',
        maximumDate,
        onValueChange: (_event, date) => onChange(date),
        onDismiss: () => onDismiss?.(),
      });
    } else {
      setIosDraft(value ?? defaultDate);
      setIosVisible(true);
    }
  };

  const closeIos = (confirm: boolean) => {
    setIosVisible(false);
    if (confirm) {
      onChange(iosDraft);
    } else {
      onDismiss?.();
    }
  };

  return (
    <View style={formStyles.field}>
      <Text style={formStyles.label} {...hiddenFromScreenReaders}>
        {label}
      </Text>
      <Pressable
        onPress={open}
        // Screen readers read it as one element:
        // "<label>, <date or 'not selected'>, button. <hint>"
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint ?? t('dateField.hint')}
        accessibilityValue={{
          text: value ? formatDate(value) : t('dateField.notSelected'),
        }}
        accessibilityState={{ expanded: iosVisible }}
        style={[
          formStyles.input,
          styles.trigger,
          error ? formStyles.inputError : null,
        ]}
      >
        <Text style={value ? formStyles.value : formStyles.placeholder}>
          {value
            ? formatDate(value)
            : (placeholder ?? t('dateField.placeholder'))}
        </Text>
        <Text style={formStyles.icon}>📅</Text>
      </Pressable>
      {error ? <ErrorText message={error} /> : null}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={iosVisible}
          transparent
          animationType="slide"
          onRequestClose={() => closeIos(false)}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => closeIos(false)}
            {...hiddenFromScreenReaders}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Pressable
                onPress={() => closeIos(false)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityHint={t('dateField.cancelHint')}
              >
                <Text style={styles.cancel}>{t('dateField.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={() => closeIos(true)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityHint={t('dateField.doneHint')}
              >
                <Text style={styles.done}>{t('dateField.done')}</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={iosDraft}
              mode="date"
              display="spinner"
              // Match the sheet: the app theme can differ from the device's.
              themeVariant={isDark ? 'dark' : 'light'}
              maximumDate={maximumDate}
              onValueChange={(_event, date) => setIosDraft(date)}
            />
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString(currentLocale(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const useStyles = makeStyles(c => ({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backdrop: {
    flex: 1,
    backgroundColor: c.overlay,
  },
  sheet: {
    backgroundColor: c.surface,
    paddingBottom: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  cancel: {
    fontSize: 16,
    color: c.textMuted,
  },
  done: {
    fontSize: 16,
    fontWeight: '700',
    color: c.primary,
  },
}));
