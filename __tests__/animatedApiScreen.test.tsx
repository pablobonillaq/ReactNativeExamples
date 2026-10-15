import { act, create } from 'react-test-renderer';
import { AnimatedApiScreen } from '../src/screens/animated/AnimatedApiScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

test('renders every Animated API demo', async () => {
  let tree!: ReturnType<typeof create>;
  await act(async () => {
    tree = create(<AnimatedApiScreen />);
  });
  const text = JSON.stringify(tree.toJSON());
  for (const title of [
    'Animated.timing',
    'Animated.spring',
    'Animated.decay',
    'Easing',
    'Animated.sequence',
    'Animated.loop',
    'extrapolate',
    'Combining values',
    'useNativeDriver',
    'Animated.createAnimatedComponent',
  ]) {
    expect(text).toContain(title);
  }
  await act(async () => tree.unmount());
});
