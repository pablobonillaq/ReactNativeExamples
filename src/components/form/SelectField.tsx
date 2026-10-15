import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';
import { makeStyles } from '../../theme';
import { useFormStyles } from './formStyles';

type Props<T extends string> = {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
  /** Called when the options are closed without picking one. */
  onDismiss?: () => void;
  error?: string;
  placeholder?: string;
  /** Optional content shown before each option label (e.g. a color swatch). */
  renderIcon?: (option: T) => ReactNode;
  /** Text shown for an option (e.g. translated). Defaults to the option itself. */
  getOptionLabel?: (option: T) => string;
};

/** Cross-platform select built with a Modal, no native dependencies. */
export function SelectField<T extends string>({
  label,
  options,
  value,
  onChange,
  onDismiss,
  error,
  placeholder,
  renderIcon,
  getOptionLabel = option => option,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const formStyles = useFormStyles();
  const styles = useStyles();
  const { t } = useTranslation('forms');

  const close = () => {
    setOpen(false);
    onDismiss?.();
  };

  return (
    <View style={formStyles.field}>
      <Text style={formStyles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          formStyles.input,
          styles.trigger,
          error ? formStyles.inputError : null,
        ]}
      >
        <View style={styles.optionContent}>
          {value && renderIcon ? renderIcon(value) : null}
          <Text style={value ? formStyles.value : formStyles.placeholder}>
            {value
              ? getOptionLabel(value)
              : (placeholder ?? t('selectField.placeholder'))}
          </Text>
        </View>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>
      {error ? <Text style={formStyles.errorText}>{error}</Text> : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close}>
          {/* Capture touches so tapping the menu itself doesn't close it */}
          <View style={styles.menu} onStartShouldSetResponder={() => true}>
            <Text style={styles.menuTitle}>{label}</Text>
            {options.map(option => {
              const selected = option === value;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setOpen(false);
                    onChange(option);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    (pressed || selected) && styles.optionActive,
                  ]}
                >
                  <View style={styles.optionContent}>
                    {renderIcon ? renderIcon(option) : null}
                    <Text style={styles.optionText}>
                      {getOptionLabel(option)}
                    </Text>
                  </View>
                  {selected ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles(c => ({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevron: {
    fontSize: 16,
    color: c.textMuted,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    backgroundColor: c.overlay,
  },
  menu: {
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: c.surface,
  },
  menuTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
    color: c.textMuted,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionActive: {
    backgroundColor: c.surfaceAlt,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionText: {
    fontSize: 16,
    color: c.text,
  },
  check: {
    fontSize: 16,
    fontWeight: '700',
    color: c.primary,
  },
}));
