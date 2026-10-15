import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { RerendersScreen } from '../src/screens/rerenders/RerendersScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

/** Render count shown by the RenderBadge with this id. */
function renders(tree: ReactTestRenderer, id: string): number {
  const [badge] = tree.root.findAll(
    node => node.props.testID === `renders:${id}`,
  );
  const children = [badge.props.children].flat();
  return children[0] as number;
}

/** Presses the first button whose label is exactly `label`. */
function press(tree: ReactTestRenderer, label: string) {
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
  act(() => {
    button.props.onPress();
  });
}

let tree: ReactTestRenderer;

beforeEach(async () => {
  await act(async () => {
    tree = create(<RerendersScreen />);
  });
});

afterEach(async () => {
  await act(async () => tree.unmount());
});

test('React.memo skips the child when the parent re-renders', () => {
  press(tree, 'Re-render parent');
  expect(renders(tree, 'memo/parent-a')).toBe(2);
  expect(renders(tree, 'memo/plain-child')).toBe(2);
  expect(renders(tree, 'memo/parent-b')).toBe(2);
  expect(renders(tree, 'memo/memo-child')).toBe(1);
});

test('memo alone fails with a new function; useCallback fixes it', () => {
  press(tree, 'Re-render parents (0)');
  expect(renders(tree, 'cb/child-a')).toBe(2);
  expect(renders(tree, 'cb/child-b')).toBe(1);
});

test('useMemo keeps an object stable for a memo child', () => {
  press(tree, 'Re-render parents');
  expect(renders(tree, 'memo-obj/chart-a')).toBe(2);
  expect(renders(tree, 'memo-obj/chart-b')).toBe(1);
});
