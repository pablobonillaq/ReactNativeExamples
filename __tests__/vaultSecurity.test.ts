import {
  attemptsLeft,
  INITIAL_LOCKOUT,
  LOCKOUT_MS,
  MAX_ATTEMPTS,
  registerFailure,
  registerSuccess,
  secondsLeft,
} from '../src/screens/vault/lockout';
import { hashPin, isValidPin, verifyPin } from '../src/screens/vault/pin';

describe('lockout', () => {
  test('locks for 1 minute after 5 wrong attempts', () => {
    let state = INITIAL_LOCKOUT;
    const now = 1_000_000;
    for (let i = 1; i < MAX_ATTEMPTS; i++) {
      state = registerFailure(state, now);
      expect(secondsLeft(state, now)).toBe(0);
      expect(attemptsLeft(state)).toBe(MAX_ATTEMPTS - i);
    }
    state = registerFailure(state, now);
    expect(secondsLeft(state, now)).toBe(60);
    expect(secondsLeft(state, now + 59_500)).toBe(1);
    expect(secondsLeft(state, now + LOCKOUT_MS)).toBe(0);
    // After the lockout there are 5 attempts again.
    expect(attemptsLeft(state)).toBe(MAX_ATTEMPTS);
  });

  test('a correct PIN resets the counter', () => {
    let state = registerFailure(registerFailure(INITIAL_LOCKOUT, 0), 0);
    expect(attemptsLeft(state)).toBe(3);
    state = registerSuccess();
    expect(attemptsLeft(state)).toBe(MAX_ATTEMPTS);
  });
});

describe('pin', () => {
  test('only 6 digits are valid', () => {
    expect(isValidPin('123456')).toBe(true);
    expect(isValidPin('12345')).toBe(false);
    expect(isValidPin('1234567')).toBe(false);
    expect(isValidPin('12a456')).toBe(false);
  });

  test('stores a salted hash, never the PIN, and verifies it', async () => {
    const stored = await hashPin('123456');
    expect(JSON.stringify(stored)).not.toContain('123456');
    await expect(verifyPin('123456', stored)).resolves.toBe(true);
    await expect(verifyPin('654321', stored)).resolves.toBe(false);
  });

  test('the same PIN gives different hashes (random salt)', async () => {
    const a = await hashPin('123456');
    const b = await hashPin('123456');
    expect(a.hash).not.toBe(b.hash);
  });
});
