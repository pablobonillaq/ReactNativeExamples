import { act, create } from 'react-test-renderer';
import { FlipperScreen } from '../src/screens/flipper/FlipperScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

test('renders the Flipper → DevTools guide', async () => {
  let tree!: ReturnType<typeof create>;
  await act(async () => {
    tree = create(<FlipperScreen />);
  });
  const text = JSON.stringify(tree.toJSON());
  for (const title of [
    'What was Flipper?',
    'Open React Native DevTools',
    'Network',
    'Profiler',
    'Breakpoints',
    'Migration table',
  ]) {
    expect(text).toContain(title);
  }
  await act(async () => tree.unmount());
});
