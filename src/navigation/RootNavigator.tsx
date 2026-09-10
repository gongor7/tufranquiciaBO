import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FranchiseDetailScreen } from '../screens/FranchiseDetailScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import type { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
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
        name="Messages"
        component={MessagesScreen}
        options={{ tabBarLabel: 'Mensajes', tabBarIcon: () => <Text style={iconStyle}>💬</Text> }}
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

interface RootNavigatorProps {
  initialIsOnboarded: boolean;
}

export function RootNavigator({ initialIsOnboarded }: RootNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialIsOnboarded ? 'MainTabs' : 'Onboarding'}
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
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Nueva franquicia' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Conversación' }} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}