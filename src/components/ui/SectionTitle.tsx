import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

export function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
});