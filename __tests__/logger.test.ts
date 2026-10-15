import * as Sentry from '@sentry/react-native';
import {
  clearLogEntries,
  createLogger,
  getLogEntries,
  redact,
} from '../src/observability/logger';

// @sentry/react-native is mocked in jest.setup.js.

beforeEach(() => {
  clearLogEntries();
  jest.clearAllMocks();
});

test('redact hides values whose key looks secret', () => {
  expect(
    redact({ pin: '123456', password: 'x', userPassword: 'y', count: 3 }),
  ).toEqual({
    pin: '[redacted]',
    password: '[redacted]',
    userPassword: '[redacted]',
    count: 3,
  });
});

test('every level is kept in the in-memory buffer and as a breadcrumb', () => {
  const log = createLogger('Test');
  log.debug('d');
  log.info('i', { a: 1 });
  log.warn('w');

  expect(getLogEntries().map(e => [e.level, e.scope, e.message])).toEqual([
    ['debug', 'Test', 'd'],
    ['info', 'Test', 'i'],
    ['warn', 'Test', 'w'],
  ]);
  expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(3);
  // Only info and above go to Sentry Logs.
  expect(Sentry.logger.debug).not.toHaveBeenCalled();
  expect(Sentry.logger.info).toHaveBeenCalledWith('[Test] i', {
    scope: 'Test',
    a: 1,
  });
  expect(Sentry.captureException).not.toHaveBeenCalled();
});

test('error() sends the original error to Sentry and returns the event id', () => {
  const log = createLogger('Test');
  const error = new Error('boom');

  const eventId = log.error('Something failed', error, { pin: '1234' });

  expect(eventId).toBe('test-event-id');
  expect(Sentry.captureException).toHaveBeenCalledWith(
    error,
    expect.objectContaining({ tags: { scope: 'Test' } }),
  );
  const [entry] = getLogEntries();
  expect(entry.eventId).toBe('test-event-id');
  expect(entry.data).toEqual({ pin: '[redacted]' });
});

test('warn() keeps the error as text without creating an issue', () => {
  const log = createLogger('Test');
  log.warn('Offline', { url: '/x' }, new TypeError('Network request failed'));

  expect(Sentry.captureException).not.toHaveBeenCalled();
  expect(getLogEntries()[0].data).toEqual({
    url: '/x',
    error: 'TypeError: Network request failed',
  });
});
