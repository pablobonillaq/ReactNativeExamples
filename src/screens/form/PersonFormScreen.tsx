import { useHeaderHeight } from '@react-navigation/elements';
import { Formik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  ScrollView,
  type ScrollViewInstance,
  type TextInputInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { BlinkHighlight } from '../../components/BlinkHighlight';
import { DateField } from '../../components/form/DateField';
import type { RootStackScreenProps } from '../../navigation/types';
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
} from './personSchema';

const log = createLogger('PersonFormFormik');

// Wait for the navigation transition to finish before scrolling/focusing.
const FOCUS_DELAY_MS = 400;

export function PersonFormScreen({
  route,
  navigation,
}: RootStackScreenProps<'PersonForm'>) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const styles = useFormScreenStyles();
  const { t } = useTranslation('forms');
  const scrollRef = useRef<ScrollViewInstance>(null);
  const phoneRef = useRef<TextInputInstance>(null);
  const emailRef = useRef<TextInputInstance>(null);
  const addressRef = useRef<TextInputInstance>(null);
  const commentsRef = useRef<TextInputInstance>(null);
  const [commentsBlink, setCommentsBlink] = useState(0);
  const focusParam = route.params?.focus;

  // Deep link rnexamples://form?focus=comments arrives as { focus: 'comments' }:
  // scroll to Comments, focus it and make it blink. The param is cleared
  // afterwards so opening the same link again triggers it again.
  useEffect(() => {
    if (focusParam !== 'comments') {
      return;
    }
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
      commentsRef.current?.focus();
      setCommentsBlink(count => count + 1);
      navigation.setParams({ focus: undefined });
    }, FOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [focusParam, navigation]);

  // Formik only calls onSubmit when every field passes validation.
  const onSubmit = (values: PersonFormValues) => {
    log.info('Form submitted', { fields: Object.keys(values).join(',') });
    Toast.show({ type: 'success', text1: t('person.submitted') });
  };

  return (
    // 'padding' on both platforms: with edge-to-edge enabled (default in new
    // RN apps, enforced on Android 15+) Android no longer resizes the window
    // for the keyboard, so adjustResize alone leaves fields hidden behind it.
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={personSchema}
        onSubmit={onSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          setFieldTouched,
        }) => (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: insets.bottom + 24 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <TextField
              label={t('person.name.label')}
              icon="👤"
              value={values.name}
              error={touched.name ? errors.name : undefined}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              placeholder={t('person.name.placeholder')}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
            <DateField
              label={t('person.birthDate.label')}
              value={values.birthDate}
              error={touched.birthDate ? errors.birthDate : undefined}
              onChange={date => {
                // Mark as touched without validating: setFieldValue validates
                // right after with the new value. Validating here would use
                // the previous (empty) value and show "required".
                setFieldTouched('birthDate', true, false);
                setFieldValue('birthDate', date);
              }}
              onDismiss={() => setFieldTouched('birthDate', true)}
              defaultDate={yearsAgo(MIN_AGE)}
              maximumDate={new Date()}
            />
            <TextField
              ref={phoneRef}
              label={t('person.phone.label')}
              icon="📞"
              value={values.phone}
              error={touched.phone ? errors.phone : undefined}
              onChangeText={handleChange('phone')}
              onBlur={handleBlur('phone')}
              placeholder={t('person.phone.placeholder')}
              keyboardType="phone-pad"
              autoComplete="tel"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            <TextField
              ref={emailRef}
              label={t('person.email.label')}
              icon="✉️"
              value={values.email}
              error={touched.email ? errors.email : undefined}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              placeholder={t('person.email.placeholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => addressRef.current?.focus()}
            />
            <TextField
              ref={addressRef}
              label={t('person.address.label')}
              icon="🏠"
              value={values.address}
              error={touched.address ? errors.address : undefined}
              onChangeText={handleChange('address')}
              onBlur={handleBlur('address')}
              placeholder={t('person.address.placeholder')}
              autoComplete="street-address"
              returnKeyType="done"
            />
            <SelectField
              label={t('person.color.label')}
              options={COLOR_OPTIONS}
              value={values.color}
              error={touched.color ? errors.color : undefined}
              onChange={color => {
                setFieldTouched('color', true, false);
                setFieldValue('color', color);
              }}
              onDismiss={() => setFieldTouched('color', true)}
              placeholder={t('person.color.placeholder')}
              getOptionLabel={color => t(`person.color.options.${color}`)}
              renderIcon={color => <ColorSwatch color={color} />}
            />
            <BlinkHighlight trigger={commentsBlink}>
              <TextField
                ref={commentsRef}
                label={t('person.comments.label')}
                value={values.comments}
                error={touched.comments ? errors.comments : undefined}
                onChangeText={handleChange('comments')}
                onBlur={handleBlur('comments')}
                placeholder={t('person.comments.placeholder')}
                multiline
                maxLength={COMMENTS_MAX_LENGTH}
              />
            </BlinkHighlight>
            <SubmitButton onPress={() => handleSubmit()} />
          </ScrollView>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
}
