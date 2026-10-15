import { yupResolver } from '@hookform/resolvers/yup';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRef } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  ScrollView,
  type TextInputInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { DateField } from '../../components/form/DateField';
import { SelectField } from '../../components/form/SelectField';
import { TextField } from '../../components/form/TextField';
import { createLogger } from '../../observability/logger';
import {
  ColorSwatch,
  SubmitButton,
  useFormScreenStyles,
  yearsAgo,
} from './formScreenShared';
import {
  COLOR_OPTIONS,
  COMMENTS_MAX_LENGTH,
  initialValues,
  MIN_AGE,
  personSchema,
  type PersonFormValues,
  type ValidPersonFormValues,
} from './personSchema';

const log = createLogger('PersonFormRHF');

/**
 * Same form as PersonFormScreen, built with React Hook Form instead of Formik.
 * It reuses the same Yup schema through @hookform/resolvers.
 */
export function PersonFormRHFScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const styles = useFormScreenStyles();
  const { t } = useTranslation('forms');
  const phoneRef = useRef<TextInputInstance>(null);
  const emailRef = useRef<TextInputInstance>(null);
  const addressRef = useRef<TextInputInstance>(null);

  // Generics: <values while editing, context, values after validation>
  const { control, handleSubmit } = useForm<
    PersonFormValues,
    unknown,
    ValidPersonFormValues
  >({
    defaultValues: initialValues,
    // yupResolver types its input as the *validated* shape (birthDate: Date),
    // but while editing birthDate starts as null, so we widen the input type.
    resolver: yupResolver(personSchema) as Resolver<
      PersonFormValues,
      unknown,
      ValidPersonFormValues
    >,
    // Like Formik: validate a field when it loses focus for the first time,
    // then on every change. Submit validates everything.
    mode: 'onTouched',
    // Our inputs are custom components, not registered refs.
    shouldFocusError: false,
  });

  // handleSubmit only calls this when every field passes validation.
  const onSubmit = (values: ValidPersonFormValues) => {
    log.info('Form submitted', { fields: Object.keys(values).join(',') });
    Toast.show({ type: 'success', text1: t('person.submitted') });
  };

  return (
    // See PersonFormScreen for why behavior is 'padding' on both platforms.
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
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              label={t('person.name.label')}
              icon="👤"
              value={field.value}
              error={fieldState.error?.message}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder={t('person.name.placeholder')}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
          )}
        />
        <Controller
          control={control}
          name="birthDate"
          render={({ field, fieldState }) => (
            <DateField
              label={t('person.birthDate.label')}
              value={field.value}
              error={fieldState.error?.message}
              onChange={date => {
                field.onChange(date);
                // onBlur marks the field as touched; with mode 'onTouched'
                // it validates using the value we just set.
                field.onBlur();
              }}
              onDismiss={field.onBlur}
              defaultDate={yearsAgo(MIN_AGE)}
              maximumDate={new Date()}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <TextField
              ref={phoneRef}
              label={t('person.phone.label')}
              icon="📞"
              value={field.value}
              error={fieldState.error?.message}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder={t('person.phone.placeholder')}
              keyboardType="phone-pad"
              autoComplete="tel"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              ref={emailRef}
              label={t('person.email.label')}
              icon="✉️"
              value={field.value}
              error={fieldState.error?.message}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder={t('person.email.placeholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => addressRef.current?.focus()}
            />
          )}
        />
        <Controller
          control={control}
          name="address"
          render={({ field, fieldState }) => (
            <TextField
              ref={addressRef}
              label={t('person.address.label')}
              icon="🏠"
              value={field.value}
              error={fieldState.error?.message}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder={t('person.address.placeholder')}
              autoComplete="street-address"
              returnKeyType="done"
            />
          )}
        />
        <Controller
          control={control}
          name="color"
          render={({ field, fieldState }) => (
            <SelectField
              label={t('person.color.label')}
              options={COLOR_OPTIONS}
              value={field.value}
              error={fieldState.error?.message}
              onChange={color => {
                field.onChange(color);
                field.onBlur();
              }}
              onDismiss={field.onBlur}
              placeholder={t('person.color.placeholder')}
              getOptionLabel={color => t(`person.color.options.${color}`)}
              renderIcon={color => <ColorSwatch color={color} />}
            />
          )}
        />
        <Controller
          control={control}
          name="comments"
          render={({ field, fieldState }) => (
            <TextField
              label={t('person.comments.label')}
              value={field.value}
              error={fieldState.error?.message}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder={t('person.comments.placeholder')}
              multiline
              maxLength={COMMENTS_MAX_LENGTH}
            />
          )}
        />
        <SubmitButton
          onPress={handleSubmit(onSubmit, invalid =>
            log.info('Form has validation errors', {
              fields: Object.keys(invalid).join(','),
            }),
          )}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
