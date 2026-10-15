import { logEvent } from '@react-native-firebase/analytics';
import { log, recordError } from '@react-native-firebase/crashlytics';
import * as Sentry from '@sentry/react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AppErrorBoundary } from '../src/observability/AppErrorBoundary';
import { createLogger } from '../src/observability/logger';

// @react-native-firebase/* and @sentry/react-native are mocked in jest.setup.js.

beforeEach(() => {
  jest.clearAllMocks();
});

/** recordError runs after setAttributes resolves: let pending promises run. */
const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

test('info logs go to the Crashlytics log; debug logs do not', () => {
  const logger = createLogger('Test');
  logger.debug('Debug line');
  logger.info('Page loaded', { offset: 20 });

  const lines = (log as jest.Mock).mock.calls.map(call => call[1]);
  expect(lines).toContain('INFO [Test] Page loaded {"offset":20}');
  expect(lines.some(line => line.includes('Debug line'))).toBe(false);
});

test('log.error reaches Sentry and Crashlytics with the original error', async () => {
  const error = new Error('Boom');
  createLogger('Test').error('Something failed', error);
  await flush();

  expect(Sentry.captureException).toHaveBeenCalledWith(
    error,
    expect.anything(),
  );
  expect(recordError).toHaveBeenCalledWith(expect.anything(), error);
});

test('secrets are redacted before reaching Crashlytics', () => {
  createLogger('Vault').info('Unlocked', { pin: '1234' });
  const lines = (log as jest.Mock).mock.calls.map(call => call[1]);
  expect(lines.join('\n')).not.toContain('1234');
});

function Broken(): never {
  throw new Error('Render error test');
}

test('the error boundary shows the fallback and reports the error', async () => {
  // React prints caught render errors; keep the test output clean.
  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = create(
      <AppErrorBoundary>
        <Broken />
      </AppErrorBoundary>,
    );
  });

  await act(flush);

  const text = JSON.stringify(tree.toJSON());
  expect(text).toContain('Something went wrong');
  expect(text).toContain('Render error test');
  expect(Sentry.captureException).toHaveBeenCalled();
  expect(recordError).toHaveBeenCalled();
  expect(logEvent).toHaveBeenCalledWith(
    expect.anything(),
    'error_boundary_shown',
    expect.objectContaining({ error_message: 'Render error test' }),
  );

  await act(async () => tree.unmount());
  consoleError.mockRestore();
});
