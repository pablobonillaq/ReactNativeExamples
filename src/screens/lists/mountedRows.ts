/**
 * Global counter of mounted rows (kept outside React on purpose).
 * The screen reads it by polling to avoid triggering re-renders
 * on every mount/unmount, which would skew the measurement.
 */
let count = 0;

export const mountedRows = {
  increment() {
    count += 1;
  },
  decrement() {
    count -= 1;
  },
  get() {
    return count;
  },
};
