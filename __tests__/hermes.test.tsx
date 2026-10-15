import { act, create } from 'react-test-renderer';
import { HermesScreen } from '../src/screens/hermes/HermesScreen';
import {
  checkFeatures,
  getHeapStats,
  isHermes,
  runBenchmarks,
} from '../src/screens/hermes/hermesRuntime';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

test('Jest runs on Node, not Hermes', () => {
  expect(isHermes()).toBe(false);
  expect(getHeapStats()).toBeNull();
});

test('feature checks and benchmarks return results', () => {
  const features = checkFeatures();
  expect(features.length).toBeGreaterThan(10);
  expect(features.find(f => f.name === 'Promise (native)')?.supported).toBe(
    true,
  );

  const results = runBenchmarks();
  expect(results.map(r => r.name)).toContain('Sort 200,000 numbers');
  results.forEach(r => expect(r.ms).toBeGreaterThanOrEqual(0));
});

test('renders the Hermes screen', async () => {
  let tree!: ReturnType<typeof create>;
  await act(async () => {
    tree = create(<HermesScreen />);
  });
  const text = JSON.stringify(tree.toJSON());
  for (const title of [
    'What is Hermes?',
    'Which engine is running?',
    'Memory and garbage collection',
    'Modern JavaScript support',
    'Benchmarks',
  ]) {
    expect(text).toContain(title);
  }
  await act(async () => tree.unmount());
});
