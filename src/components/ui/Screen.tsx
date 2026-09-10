import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../theme';

export function Screen({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function LoadingScreen({ label = 'Cargando...' }: { label?: string }) {
  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  label: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 14,
  },
});