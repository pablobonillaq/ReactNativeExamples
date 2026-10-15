import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { createNativeBridgeDemoFake } from '../__mocks__/nativeBridgeDemoFake';
import {
  runBridgeBenchmark,
  setBridgeModuleForTests,
} from '../src/screens/bridging/bridgeModule';
import { BridgingScreen } from '../src/screens/bridging/BridgingScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// The real module is Kotlin / Objective-C++; Jest uses a fake with the same
// methods (see __mocks__/nativeBridgeDemoFake.ts).

let tree: ReactTestRenderer;

async function renderScreen() {
  await act(async () => {
    tree = create(<BridgingScreen />);
  });
}

function text() {
  return JSON.stringify(tree.toJSON());
}

/** Presses the first button whose label is exactly `label`. */
async function press(label: string) {
  const button = tree.root
    .findAll(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    )
    .find(node => node.findAll(c => c.props.children === label).length > 0);
  if (!button) {
    throw new Error(`Button "${label}" not found`);
  }
  await act(async () => {
    await button.props.onPress();
  });
}

afterEach(async () => {
  await act(async () => tree?.unmount());
  setBridgeModuleForTests(null);
});

test('sync, async and callback calls show their results', async () => {
  setBridgeModuleForTests(createNativeBridgeDemoFake());
  await renderScreen();

  await press('Call currentThread()');
  expect(text()).toContain('jest-js');

  await press('Call asyncThread() and addAsync()');
  expect(text()).toContain('jest-native');

  await press('Call withCallback(21, …)');
  expect(text()).toContain('Fake got 21 and sends back 42');
});

test('events from native reach JS until the subscription is removed', async () => {
  const fake = createNativeBridgeDemoFake();
  setBridgeModuleForTests(fake);
  await renderScreen();

  await press('startTicking(500)');
  expect(fake.ticking).toBe(true);
  await act(async () => {
    fake.emitTick();
    fake.emitTick();
  });
  expect(text()).toContain('jest-main');

  // Closing the screen removes the listener and stops the native timer.
  await act(async () => tree.unmount());
  expect(fake.ticking).toBe(false);
});

test('a native rejection arrives as an Error with its code', async () => {
  setBridgeModuleForTests(createNativeBridgeDemoFake());
  await renderScreen();
  await press('Call fail()');
  expect(text()).toContain('E_DEMO');
});

test('the benchmark measures JS, sync and async calls', async () => {
  const results = await runBridgeBenchmark(createNativeBridgeDemoFake(), 50);
  expect(results.map(r => r.name)).toEqual([
    'Plain JS function',
    'Native sync add()',
    'Native async addAsync()',
  ]);
  results.forEach(r => expect(r.calls).toBe(50));
});

test('without the native module the screen explains how to rebuild', async () => {
  setBridgeModuleForTests(null);
  await renderScreen();
  expect(text()).toContain('NativeBridgeDemo is not in the installed app');
  // The explanations are still there.
  expect(text()).toContain('The old bridge vs JSI');
});
