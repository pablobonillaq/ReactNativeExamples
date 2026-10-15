export type Person = {
  id: string;
  name: string;
  email: string;
  city: string;
  color: string;
};

const FIRST_NAMES = [
  'Emma',
  'Liam',
  'Olivia',
  'Noah',
  'Ava',
  'James',
  'Sophia',
  'William',
  'Isabella',
  'Benjamin',
  'Mia',
  'Lucas',
  'Charlotte',
  'Henry',
  'Amelia',
  'Jack',
];
const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Miller',
  'Davis',
  'Wilson',
  'Anderson',
  'Taylor',
  'Thomas',
  'Moore',
  'Martin',
  'Clark',
];
const CITIES = [
  'New York',
  'London',
  'San Francisco',
  'Toronto',
  'Sydney',
  'Chicago',
  'Boston',
  'Seattle',
  'Dublin',
  'Austin',
  'Vancouver',
  'Manchester',
];
// Avatar colors are part of the fake data (each person keeps the same
// color in both themes), so they stay constant on purpose.
const AVATAR_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#64748b',
];

/** Initials on top of the avatar colors above (same in both themes). */
export const AVATAR_TEXT_COLOR = '#ffffff';

export function generatePeople(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    return {
      id: String(i),
      name: `${first} ${last}`,
      email: `${first}.${last}${i}@example.com`.toLowerCase(),
      city: CITIES[(i * 3) % CITIES.length],
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    };
  });
}
