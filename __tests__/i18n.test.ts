import { resources } from '../src/i18n/resources';

/** { a: { b: 'x' } } → { 'a.b': 'x' } */
function flatten(value: unknown, prefix = ''): Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return { [prefix]: value };
  }
  return Object.entries(value).reduce<Record<string, unknown>>(
    (all, [key, child]) => ({
      ...all,
      ...flatten(child, prefix ? `${prefix}.${key}` : key),
    }),
    {},
  );
}

const variables = (text: unknown) =>
  [...String(text).matchAll(/{{\s*(\w+)\s*}}/g)].map(m => m[1]).sort();

const namespaces = Object.keys(resources.en) as (keyof typeof resources.en)[];

test.each(namespaces)('"%s" has the same keys in English and Spanish', ns => {
  const en = flatten(resources.en[ns]);
  const es = flatten(resources.es[ns]);
  expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
});

test.each(namespaces)(
  '"%s" has no empty texts and the same {{variables}}',
  ns => {
    const en = flatten(resources.en[ns]);
    const es = flatten(resources.es[ns]);
    for (const [key, text] of Object.entries(en)) {
      expect(typeof text).toBe('string');
      expect(String(text).trim()).not.toBe('');
      expect(String(es[key]).trim()).not.toBe('');
      expect(variables(es[key])).toEqual(variables(text));
    }
  },
);
