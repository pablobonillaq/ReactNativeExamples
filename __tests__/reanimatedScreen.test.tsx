import type { ComponentType, ReactElement } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import * as AnimationFunctionDemos from '../src/screens/reanimated/demos/AnimationFunctionDemos';
import * as CssDemos from '../src/screens/reanimated/demos/CssDemos';
import * as DeviceDemos from '../src/screens/reanimated/demos/DeviceDemos';
import * as GestureDemos from '../src/screens/reanimated/demos/GestureDemos';
import * as InterpolationDemos from '../src/screens/reanimated/demos/InterpolationDemos';
import * as LayoutAnimationDemos from '../src/screens/reanimated/demos/LayoutAnimationDemos';
import * as ModifierDemos from '../src/screens/reanimated/demos/ModifierDemos';
import * as ScrollDemos from '../src/screens/reanimated/demos/ScrollDemos';
import * as SharedValueDemos from '../src/screens/reanimated/demos/SharedValueDemos';
import * as ThreadDemos from '../src/screens/reanimated/demos/ThreadDemos';
import { ReanimatedScreen } from '../src/screens/reanimated/ReanimatedScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

/**
 * React 19 reports several render errors as one AggregateError with an empty
 * message. Unwrap it so a failing test says what actually broke.
 */
function unwrap(error: unknown): Error {
  const inner = (error as { errors?: unknown[] }).errors;
  if (!Array.isArray(inner)) {
    return error as Error;
  }
  const details = inner
    .map(e => (e instanceof Error ? (e.stack ?? e.message) : String(e)))
    .join('\n\n');
  return new Error(`${inner.length} render error(s):\n\n${details}`);
}

async function render(element: ReactElement) {
  let tree!: ReactTestRenderer;
  try {
    await act(async () => {
      // Gesture Handler 3 detectors must live inside a GestureHandlerRootView
      // (App.tsx provides it in the real app).
      tree = create(<GestureHandlerRootView>{element}</GestureHandlerRootView>);
    });
  } catch (error) {
    throw unwrap(error);
  }
  return tree;
}

// Every exported demo component, rendered on its own so a failure names it.
const DEMOS = Object.entries({
  ...SharedValueDemos,
  ...AnimationFunctionDemos,
  ...ModifierDemos,
  ...InterpolationDemos,
  ...GestureDemos,
  ...ScrollDemos,
  ...LayoutAnimationDemos,
  ...ThreadDemos,
  ...DeviceDemos,
  ...CssDemos,
}).filter(([name]) => name.endsWith('Demo')) as [string, ComponentType][];

test.each(DEMOS)('%s renders', async (_name, Demo) => {
  const tree = await render(<Demo />);
  await act(async () => tree.unmount());
});

test('renders every Reanimated section', async () => {
  const tree = await render(<ReanimatedScreen />);
  const text = JSON.stringify(tree.toJSON());
  for (const title of [
    'useSharedValue + useAnimatedStyle',
    'withTiming',
    'withSpring',
    'withDecay',
    'withSequence',
    'interpolateColor',
    'Pan + withDecay',
    'useAnimatedScrollHandler',
    'entering / exiting',
    'useFrameCallback',
    'useAnimatedSensor',
    'CSS animations (Reanimated 4)',
  ]) {
    expect(text).toContain(title);
  }
  await act(async () => tree.unmount());
});
