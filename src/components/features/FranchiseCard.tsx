import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radii } from '../../theme';
import { getFranchiseImage } from '../../constants/images';
import { formatInvestmentRange, formatUSD } from '../../utils/formatters';
import type { Franchise } from '../../types';

interface FranchiseCardProps {
  franchise: Franchise;
  onPress?: () => void;
  showFavorite?: boolean;
}

export function FranchiseCard({ franchise, onPress }: FranchiseCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !imageFailed;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        {showImage ? (
          <Image
            source={{ uri: getFranchiseImage(franchise.slug) }}
            style={styles.image}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackEmoji}>{franchise.logoEmoji}</Text>
          </View>
        )}
        <View style={styles.imageOverlay} />
        {franchise.featured && <Text style={styles.featuredBadge}>★ Destacada</Text>}
        <View style={styles.cityBadge}>
          <Text style={styles.cityBadgeText}>📍 {franchise.city}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {franchise.name}
        </Text>
        {franchise.tagline != null && (
          <Text style={styles.tagline} numberOfLines={1}>
            {franchise.tagline}
          </Text>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {franchise.industryEmoji} {getIndustryLabelShort(franchise.industry)}
          </Text>
          {franchise.estimatedRoi != null && (
            <Text style={styles.roiText}>ROI {franchise.estimatedRoi}</Text>
          )}
        </View>

        <View style={styles.investmentRow}>
          <Text style={styles.investment} numberOfLines={1}>
            {formatInvestmentRange(
              franchise.minInvestment,
              franchise.maxInvestment,
              franchise.currency,
            )}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.views}>👁 {franchise.viewsCount} vistas</Text>
          <Text style={styles.from}>Desde {formatUSD(franchise.minInvestment)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function getIndustryLabelShort(industry: string): string {
  const labels: Record<string, string> = {
    comida: 'Comida y Bebida',
    retail: 'Retail y Moda',
    servicios: 'Servicios',
    educacion: 'Educación',
    tecnologia: 'Tecnología',
    salud: 'Salud y Bienestar',
    fitness: 'Fitness',
    belleza: 'Belleza',
  };
  return labels[industry] ?? industry;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  imageWrap: {
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackEmoji: {
    fontSize: 44,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11,37,69,0.18)',
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent,
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    overflow: 'hidden',
    letterSpacing: 0.5,
  },
  cityBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(11,37,69,0.75)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  cityBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    padding: spacing.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  tagline: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  metaText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  roiText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.success,
  },
  investmentRow: {
    marginTop: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
  },
  investment: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  views: {
    fontSize: 11,
    color: colors.textLight,
  },
  from: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
  },
});
