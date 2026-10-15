/**
 * Shape of a translation file: the same keys as the English one, with
 * strings as values. `es/x.ts` is typed `Translation<typeof en>`, so a
 * missing or extra key is a TypeScript error.
 */
export type Translation<T> = {
  [K in keyof T]: T[K] extends string ? string : Translation<T[K]>;
};
