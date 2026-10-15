/**
 * Wrong-PIN lockout rules, as pure functions (easy to test):
 * after MAX_ATTEMPTS wrong PINs in a row, PIN entry is blocked for
 * LOCKOUT_MS. A correct PIN resets the counter.
 */

export const MAX_ATTEMPTS = 5;
export const LOCKOUT_MS = 60_000;

export type LockoutState = {
  /** Wrong attempts since the last success or lockout. */
  failedAttempts: number;
  /** Epoch ms until which PIN entry is blocked (0 = not locked). */
  lockedUntil: number;
};

export const INITIAL_LOCKOUT: LockoutState = {
  failedAttempts: 0,
  lockedUntil: 0,
};

export function registerFailure(
  state: LockoutState,
  now: number,
): LockoutState {
  const failedAttempts = state.failedAttempts + 1;
  if (failedAttempts >= MAX_ATTEMPTS) {
    return { failedAttempts: 0, lockedUntil: now + LOCKOUT_MS };
  }
  return { ...state, failedAttempts };
}

export function registerSuccess(): LockoutState {
  return INITIAL_LOCKOUT;
}

/** Whole seconds left in the lockout (0 when not locked). */
export function secondsLeft(state: LockoutState, now: number) {
  return Math.max(0, Math.ceil((state.lockedUntil - now) / 1000));
}

export function attemptsLeft(state: LockoutState) {
  return MAX_ATTEMPTS - state.failedAttempts;
}
