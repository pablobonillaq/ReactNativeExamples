import { useCallback, useEffect, useRef, useState } from 'react';
import {
  attemptsLeft,
  INITIAL_LOCKOUT,
  registerFailure,
  registerSuccess,
  secondsLeft,
  type LockoutState,
} from './lockout';
import { loadLockout, saveLockout } from './vaultStorage';
import { createLogger } from '../../observability/logger';

const log = createLogger('VaultLockout');

/**
 * Wrong-PIN counter shared by the unlock screen and the "reveal password"
 * prompt. It's persisted, so leaving the screen or restarting the app
 * doesn't reset the countdown.
 */
export function useLockout() {
  const [state, setState] = useState<LockoutState>(INITIAL_LOCKOUT);
  const [now, setNow] = useState(() => Date.now());
  const stateRef = useRef(state);

  const update = useCallback((next: LockoutState) => {
    stateRef.current = next;
    setState(next);
    saveLockout(next);
  }, []);

  useEffect(() => {
    loadLockout().then(saved => {
      stateRef.current = saved;
      setState(saved);
    });
  }, []);

  const remaining = secondsLeft(state, now);

  // Countdown: tick every second only while locked.
  useEffect(() => {
    if (remaining <= 0) {
      return;
    }
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  return {
    isLocked: remaining > 0,
    secondsLeft: remaining,
    attemptsLeft: attemptsLeft(state),
    failedAttempts: state.failedAttempts,
    registerFailure: useCallback(() => {
      const t = Date.now();
      setNow(t);
      const next = registerFailure(stateRef.current, t);
      log.warn('Wrong PIN', {
        failedAttempts: next.failedAttempts,
        lockedForSeconds: secondsLeft(next, t),
      });
      update(next);
    }, [update]),
    registerSuccess: useCallback(() => update(registerSuccess()), [update]),
  };
}

export type Lockout = ReturnType<typeof useLockout>;
