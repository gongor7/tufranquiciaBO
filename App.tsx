import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/database/db';
import { useOnboardingStore } from './src/stores/useOnboardingStore';
import { useUserStore } from './src/stores/useUserStore';
import { useTicketStore } from './src/stores/useTicketStore';
import { useFranchiseStore } from './src/stores/useFranchiseStore';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LoadingScreen } from './src/components/ui/Screen';

export default function App() {
  const [booted, setBooted] = useState(false);
  const onboardingLoading = useOnboardingStore((s) => s.loading);
  const checkOnboarding = useOnboardingStore((s) => s.check);

  useEffect(() => {
    void (async () => {
      await initDatabase();
      await useUserStore.getState().loadProfile();
      await useFranchiseStore.getState().loadFavorites();
      await useFranchiseStore.getState().loadFeatured();
      await useFranchiseStore.getState().loadPopular();
      await useTicketStore.getState().loadTickets();
      await checkOnboarding();
      setBooted(true);
    })();
  }, [checkOnboarding]);

  if (!booted || onboardingLoading) {
    return <LoadingScreen label="Iniciando TuFranquiciaBO..." />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
