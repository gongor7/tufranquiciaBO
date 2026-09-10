import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radii } from '../../theme';
import { formatInvestmentRange } from '../../utils/formatters';
import { Chip } from '../ui/Chip';
import type { Franchise } from '../../types';

interface FranchiseCardProps {
  franchise: Franchise;
  onPress?: () => void;
  showFavorite?: boolean;
}

export function FranchiseCard({ franchise, onPress }: FranchiseCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View style={styles.logoBox}>
          <Text style={styles.logo}>{franchise.logoEmoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {franchise.name}
          </Text>
          <Text style={styles.tagline} numberOfLines={1}>
            {franchise.tagline}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>
              {franchise.industryEmoji} {franchise.industry}
            </Text>
            <Text style={styles.metaText}>📍 {franchise.city}</Text>
          </View>
          <Text style={styles.investment}>
            {formatInvestmentRange(franchise.minInvestment, franchise.maxInvestment, franchise.currency)}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Chip label="Ver detalle" selected />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 30,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  tagline: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  investment: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: spacing.sm,
    alignItems: 'flex-end',
  },
});