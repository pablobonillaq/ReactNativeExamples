import * as Yup from 'yup';
import i18n from '../../i18n';

export const COLOR_OPTIONS = ['red', 'blue', 'yellow'] as const;
export type ColorOption = (typeof COLOR_OPTIONS)[number];

export type PersonFormValues = {
  name: string;
  birthDate: Date | null;
  phone: string;
  email: string;
  address: string;
  color: ColorOption | null;
  comments: string;
};

export const initialValues: PersonFormValues = {
  name: '',
  birthDate: null,
  phone: '',
  email: '',
  address: '',
  color: null,
  comments: '',
};

export const MIN_AGE = 18;
export const PHONE_MIN_DIGITS = 9;
export const PHONE_MAX_DIGITS = 15;
export const COMMENTS_MAX_LENGTH = 200;

function ageOn(birthDate: Date, today: Date) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayNotReached =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate());
  if (birthdayNotReached) {
    age -= 1;
  }
  return age;
}

export const personSchema = Yup.object({
  // Messages are functions so they are translated when validation runs, in
  // the current language (the schema itself is created at module load).
  // Yup runs tests in order and forms show the first error,
  // so `required` goes first to get "is required" for an empty field.
  name: Yup.string()
    .trim()
    .required(() => i18n.t('forms:validation.nameRequired'))
    .min(2, () => i18n.t('forms:validation.nameMin', { min: 2 })),
  birthDate: Yup.date()
    .nullable()
    .required(() => i18n.t('forms:validation.birthDateRequired'))
    .test(
      'not-future',
      () => i18n.t('forms:validation.birthDateFuture'),
      value => (value ? value <= new Date() : true),
    )
    .test(
      'adult',
      () => i18n.t('forms:validation.adult', { age: MIN_AGE }),
      value => (value ? ageOn(value, new Date()) >= MIN_AGE : true),
    ),
  phone: Yup.string()
    .required(() => i18n.t('forms:validation.phoneRequired'))
    .matches(/^\+?[\d\s-]+$/, () => i18n.t('forms:validation.phoneFormat'))
    .test(
      'length',
      () =>
        i18n.t('forms:validation.phoneLength', {
          min: PHONE_MIN_DIGITS,
          max: PHONE_MAX_DIGITS,
        }),
      value => {
        const digits = (value ?? '').replace(/\D/g, '').length;
        return digits >= PHONE_MIN_DIGITS && digits <= PHONE_MAX_DIGITS;
      },
    ),
  email: Yup.string()
    .trim()
    .required(() => i18n.t('forms:validation.emailRequired'))
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, () =>
      i18n.t('forms:validation.emailInvalid'),
    ),
  address: Yup.string()
    .trim()
    .required(() => i18n.t('forms:validation.addressRequired')),
  color: Yup.mixed<ColorOption>()
    .oneOf([...COLOR_OPTIONS], () => i18n.t('forms:validation.colorInvalid'))
    .nullable(),
  comments: Yup.string().max(COMMENTS_MAX_LENGTH, () =>
    i18n.t('forms:validation.commentsMax', { max: COMMENTS_MAX_LENGTH }),
  ),
});

/** Values after passing validation (e.g. birthDate is a Date, never null). */
export type ValidPersonFormValues = Yup.InferType<typeof personSchema>;
