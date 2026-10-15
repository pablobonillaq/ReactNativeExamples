import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createDrawerNavigator,
  DrawerToggleButton,
} from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';
import type {
  DemoDrawerParamList,
  DemoStackParamList,
  DemoTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import { makeStyles, useTheme } from '../../theme';
import { DemoCard } from './DemoCard';
import { detailParams } from './detailParams';
import { NavDetailScreen } from './NavDetailScreen';

/**
 * Navigation demo. The screen is a Drawer navigator with three items:
 * - Drawer: a plain drawer screen.
 * - Tabs:   a Bottom Tab navigator nested inside the drawer.
 * - Stack:  a Native Stack navigator nested inside the drawer.
 *
 * All of them open the same NavDetailScreen, passing title, text and image
 * as params. The header title also comes from the params.
 */

const Drawer = createDrawerNavigator<DemoDrawerParamList>();
const Tab = createBottomTabNavigator<DemoTabParamList>();
const DemoStack = createNativeStackNavigator<DemoStackParamList>();

/** Navigation of the root stack, where NavDetail is registered. */
function useRootNavigation() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}

/**
 * The root stack header is hidden for this demo, so this button returns to
 * the examples menu. popTo('Home') isn't handled by the drawer or the nested
 * stack, so it bubbles up to the root stack.
 */
function ExitButton() {
  const navigation = useRootNavigation();
  const themedStyles = useThemedStyles();
  const { t } = useTranslation('navigationDemo');
  return (
    <Pressable
      onPress={() => navigation.popTo('Home')}
      hitSlop={8}
      style={styles.exitButton}
    >
      <Text style={themedStyles.exitText}>{t('exit')}</Text>
    </Pressable>
  );
}

/* ---------- Drawer ---------- */

function DrawerHomeScreen() {
  const navigation = useRootNavigation();
  const { t } = useTranslation('navigationDemo');
  return (
    <DemoCard
      emoji="🗂️"
      title={t('drawer.title')}
      description={t('drawer.description')}
      buttonLabel={t('drawer.button')}
      onPress={() =>
        // NavDetail is not in the drawer, so the navigate call bubbles up
        // to the parent navigator (the root stack), which handles it.
        navigation.navigate(
          'NavDetail',
          detailParams({
            source: t('drawer.source'),
            title: t('drawer.detailTitle'),
            imageSeed: 'drawer',
          }),
        )
      }
    />
  );
}

/* ---------- Tabs ---------- */

function TabOneScreen() {
  const navigation = useRootNavigation();
  const { t } = useTranslation('navigationDemo');
  return (
    <DemoCard
      emoji="1️⃣"
      title={t('tabs.one.title')}
      description={t('tabs.one.description')}
      buttonLabel={t('tabs.one.button')}
      onPress={() =>
        navigation.navigate(
          'NavDetail',
          detailParams({
            source: t('tabs.source'),
            title: t('tabs.one.detailTitle'),
            imageSeed: 'tab-one',
          }),
        )
      }
    />
  );
}

function TabTwoScreen() {
  const navigation = useRootNavigation();
  const { t } = useTranslation('navigationDemo');
  return (
    <DemoCard
      emoji="2️⃣"
      title={t('tabs.two.title')}
      description={t('tabs.two.description')}
      buttonLabel={t('tabs.two.button')}
      onPress={() =>
        navigation.navigate(
          'NavDetail',
          detailParams({
            source: t('tabs.source'),
            title: t('tabs.two.detailTitle'),
            imageSeed: 'tab-two',
          }),
        )
      }
    />
  );
}

function TabsDemo() {
  const { colors } = useTheme();
  const { t } = useTranslation('navigationDemo');
  return (
    <Tab.Navigator
      screenOptions={{
        // The drawer already shows a header for this screen.
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="TabOne"
        component={TabOneScreen}
        options={{
          title: t('tabs.one.tabTitle'),
          tabBarIcon: renderTabOneIcon,
        }}
      />
      <Tab.Screen
        name="TabTwo"
        component={TabTwoScreen}
        options={{
          title: t('tabs.two.tabTitle'),
          tabBarIcon: renderTabTwoIcon,
        }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={[styles.tabIcon, !focused && styles.tabIconInactive]}>
      {emoji}
    </Text>
  );
}

// Render functions for navigator options are defined once at module level so
// React doesn't see a new component type on every render.
const renderTabOneIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon emoji="🏠" focused={focused} />
);
const renderTabTwoIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon emoji="⭐" focused={focused} />
);

/* ---------- Stack ---------- */

function StackHomeScreen({
  navigation,
}: NativeStackScreenProps<DemoStackParamList, 'StackHome'>) {
  const { t } = useTranslation('navigationDemo');
  return (
    <DemoCard
      emoji="📚"
      title={t('stack.title')}
      description={t('stack.description')}
      buttonLabel={t('stack.button')}
      onPress={() =>
        navigation.push(
          'StackDetail',
          detailParams({
            source: t('stack.source'),
            title: t('stack.detailTitle'),
            imageSeed: 'stack',
          }),
        )
      }
    />
  );
}

function StackDemo() {
  const { colors } = useTheme();
  const { t } = useTranslation('navigationDemo');
  return (
    <DemoStack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <DemoStack.Screen
        name="StackHome"
        component={StackHomeScreen}
        options={{
          title: t('menu.stack'),
          // The drawer header is hidden for this item, so the stack header
          // shows the ☰ button to keep the drawer reachable.
          headerLeft: renderDrawerToggle,
          headerRight: renderExitButton,
        }}
      />
      <DemoStack.Screen
        name="StackDetail"
        component={NavDetailScreen}
        options={({ route }) => ({ title: route.params.headerTitle })}
      />
    </DemoStack.Navigator>
  );
}

/* ---------- Drawer navigator (the screen itself) ---------- */

export function NavigationDemoScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('navigationDemo');
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        drawerActiveBackgroundColor: colors.primarySoft,
        drawerInactiveTintColor: colors.textSecondary,
        drawerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerRight: renderExitButton,
      }}
    >
      <Drawer.Screen
        name="DrawerHome"
        component={DrawerHomeScreen}
        options={{
          title: t('menu.drawer'),
          drawerIcon: renderDrawerHomeIcon,
        }}
      />
      <Drawer.Screen
        name="TabsDemo"
        component={TabsDemo}
        options={{ title: t('menu.tabs'), drawerIcon: renderTabsIcon }}
      />
      <Drawer.Screen
        name="StackDemo"
        component={StackDemo}
        options={{
          title: t('menu.stack'),
          // The nested stack renders its own header.
          headerShown: false,
          drawerIcon: renderStackIcon,
        }}
      />
    </Drawer.Navigator>
  );
}

const renderExitButton = () => <ExitButton />;
const renderDrawerToggle = () => <DrawerToggle />;
const renderDrawerHomeIcon = () => <Text style={styles.drawerIcon}>🗂️</Text>;
const renderTabsIcon = () => <Text style={styles.drawerIcon}>📑</Text>;
const renderStackIcon = () => <Text style={styles.drawerIcon}>📚</Text>;

function DrawerToggle() {
  const { colors } = useTheme();
  return <DrawerToggleButton tintColor={colors.primary} />;
}

const useThemedStyles = makeStyles(c => ({
  exitText: {
    fontSize: 16,
    fontWeight: '600',
    color: c.primary,
  },
}));

const styles = StyleSheet.create({
  exitButton: {
    marginRight: 16,
  },
  drawerIcon: {
    fontSize: 20,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabIconInactive: {
    opacity: 0.4,
  },
});
