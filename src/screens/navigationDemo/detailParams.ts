import i18n from '../../i18n';
import type { NavDetailParams } from '../../navigation/types';

// Placeholder text: Latin in every language, so it is not translated.

const LOREM_IPSUM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod ' +
  'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim ' +
  'veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea ' +
  'commodo consequat. Duis aute irure dolor in reprehenderit in voluptate ' +
  'velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat ' +
  'cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id ' +
  'est laborum.';

type Options = {
  /**
   * Navigator that opens the detail, e.g. "Drawer navigation" (already
   * translated by the caller, like `title`).
   */
  source: string;
  title: string;
  /** Picsum seed: the same seed always returns the same image. */
  imageSeed: string;
};

/**
 * Builds the params every navigator passes to the shared detail screen.
 * Called when navigating, so the texts are in the current language.
 */
export function detailParams({
  source,
  title,
  imageSeed,
}: Options): NavDetailParams {
  return {
    headerTitle: i18n.t('navigationDemo:detail.headerTitle', { source }),
    source,
    title,
    text: LOREM_IPSUM,
    imageUrl: `https://picsum.photos/seed/${imageSeed}/800/500`,
  };
}
