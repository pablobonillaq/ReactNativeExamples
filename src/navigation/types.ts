import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Params received by the shared detail screen of the navigation demo. */
export type NavDetailParams = {
  /** Text shown in the header, set from the params in the screen options. */
  headerTitle: string;
  /** Which navigator opened the screen, e.g. "Drawer navigation". */
  source: string;
  title: string;
  text: string;
  imageUrl: string;
};

export type RootStackParamList = {
  Home: undefined;
  Lists: undefined;
  Pokemon: undefined;
  PokemonInfinite: undefined;
  /** `focus` is set by the deep link rnexamples://form?focus=comments */
  PersonForm: { focus?: 'comments' } | undefined;
  PersonFormRHF: undefined;
  DeepLinkDemo: undefined;
  BreakingBad: undefined;
  BreakingBadCharacter: { id: number; name: string };
  Todo: undefined;
  TodoRedux: undefined;
  TodoZustand: undefined;
  TodoMobx: undefined;
  TodoStorage: undefined;
  TodoSqlite: undefined;
  TodoNative: undefined;
  PhotoGallery: undefined;
  Accessibility: undefined;
  Vault: undefined;
  BusesMap: undefined;
  Share: undefined;
  SentryDebug: undefined;
  AnimatedApi: undefined;
  Reanimated: undefined;
  Flipper: undefined;
  Hermes: undefined;
  Rerenders: undefined;
  Bridging: undefined;
  NavigationDemo: NavigatorScreenParams<DemoDrawerParamList> | undefined;
  NavDetail: NavDetailParams;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/* Navigation demo: a drawer that contains a tab navigator and a stack. */

export type DemoDrawerParamList = {
  DrawerHome: undefined;
  TabsDemo: NavigatorScreenParams<DemoTabParamList> | undefined;
  StackDemo: NavigatorScreenParams<DemoStackParamList> | undefined;
};

export type DemoTabParamList = {
  TabOne: undefined;
  TabTwo: undefined;
};

export type DemoStackParamList = {
  StackHome: undefined;
  StackDetail: NavDetailParams;
};
