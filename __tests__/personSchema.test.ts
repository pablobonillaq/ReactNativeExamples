import {
  personSchema,
  type PersonFormValues,
} from '../src/screens/form/personSchema';

const valid: PersonFormValues = {
  name: 'Emma Smith',
  birthDate: new Date(1990, 0, 15),
  phone: '+1 555 123 4567',
  email: 'emma@example.com',
  address: '221B Baker Street, London',
  color: null,
  comments: '',
};

function yearsAgo(years: number, dayOffset = 0) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() + dayOffset);
  return d;
}

async function errorFor<K extends keyof PersonFormValues>(
  field: K,
  value: PersonFormValues[K] | string,
) {
  try {
    await personSchema.validateAt(field, { ...valid, [field]: value });
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

test('accepts valid values', async () => {
  await expect(personSchema.isValid(valid)).resolves.toBe(true);
});

test('name: required first, then min length', async () => {
  expect(await errorFor('name', '')).toMatch(/required/);
  expect(await errorFor('name', 'A')).toMatch(/at least 2/);
});

test('birth date: required, not in the future, only adults', async () => {
  expect(await errorFor('birthDate', null)).toMatch(/required/);
  expect(await errorFor('birthDate', yearsAgo(18))).toBeNull();
  expect(await errorFor('birthDate', yearsAgo(18, 1))).toMatch(/at least 18/);
  expect(await errorFor('birthDate', yearsAgo(10))).toMatch(/at least 18/);
  expect(await errorFor('birthDate', yearsAgo(-1))).toMatch(/future/);
});

test('phone length', async () => {
  expect(await errorFor('phone', '12345678')).toMatch(/between 9 and 15/);
  expect(await errorFor('phone', '123456789')).toBeNull();
  expect(await errorFor('phone', '1234567890123456')).toMatch(
    /between 9 and 15/,
  );
  expect(await errorFor('phone', '555-abc-1234')).toMatch(/Only digits/);
});

test('email format', async () => {
  expect(await errorFor('email', 'emma@example')).toMatch(/valid email/);
  expect(await errorFor('email', 'emma example.com')).toMatch(/valid email/);
  expect(await errorFor('email', 'emma.smith@mail.co.uk')).toBeNull();
});

test('address is required', async () => {
  expect(await errorFor('address', '')).toMatch(/required/);
  expect(await errorFor('address', '   ')).toMatch(/required/);
});

test('color: optional, only allowed options', async () => {
  expect(await errorFor('color', null)).toBeNull();
  expect(await errorFor('color', 'blue')).toBeNull();
  expect(await errorFor('color', 'green')).toMatch(/valid color/);
});

test('comments: max 200 characters', async () => {
  expect(await errorFor('comments', 'a'.repeat(200))).toBeNull();
  expect(await errorFor('comments', 'a'.repeat(201))).toMatch(/200/);
});
