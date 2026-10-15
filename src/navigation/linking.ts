import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/** Custom URL scheme registered in AndroidManifest.xml and iOS Info.plist. */
export const DEEP_LINK_PREFIX = 'rnexamples://';

/** Deep link that opens the Formik form and highlights the Comments field. */
export const LEAVE_COMMENT_URL = `${DEEP_LINK_PREFIX}form?focus=comments`;

/**
 * Maps URLs to screens. React Navigation listens to incoming links (both
 * when the app is opened by a link and while it's running) and navigates:
 *   rnexamples://form?focus=comments  ->  PersonForm { focus: 'comments' }
 * Query params become route params.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [DEEP_LINK_PREFIX],
  config: {
    // If the app is cold-started by a link, keep Home below the linked
    // screen so the back button returns to the menu.
    initialRouteName: 'Home',
    screens: {
      Home: '',
      PersonForm: 'form',
      DeepLinkDemo: 'deeplink',
    },
  },
};
