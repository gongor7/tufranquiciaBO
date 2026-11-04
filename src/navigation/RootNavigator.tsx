import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { TicketsScreen } from '../screens/TicketsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FranchiseDetailScreen } from '../screens/FranchiseDetailScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { useUserStore } from '../stores/useUserStore';
import { useOnboardingStore } from '../stores/useOnboardingStore';
import { useTicketStore } from '../stores/useTicketStore';
import type { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const tickets = useTicketStore((s) => s.tickets);
  const newCount = tickets.filter((t) => t.status === 'nuevo').length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.white },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Inicio', tabBarIcon: () => <Text style={iconStyle}>🏠</Text> }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ tabBarLabel: 'Explorar', tabBarIcon: () => <Text style={iconStyle}>🔎</Text> }}
      />
      <Tab.Screen
        name="Tickets"
        component={TicketsScreen}
        options={{
          tabBarLabel: 'Solicitudes',
          tabBarIcon: () => <Text style={iconStyle}>📩</Text>,
          ...(newCount > 0 ? { tabBarBadge: newCount } : {}),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil', tabBarIcon: () => <Text style={iconStyle}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

const iconStyle = { fontSize: 18 };

/**
 * Gate reactivo: sin registro no hay exploración (RF-37). Cuando el
 * registro se completa, se monta la navegación principal.
 */
export function RootNavigator() {
  const registered = useUserStore((s) => s.registered);
  const isCompleted = useOnboardingStore((s) => s.isCompleted);

  if (!registered) {
    return <WelcomeScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isCompleted ? 'MainTabs' : 'Onboarding'}
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="FranchiseDetail"
          component={FranchiseDetailScreen}
          options={{ title: 'Detalle' }}
        />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
