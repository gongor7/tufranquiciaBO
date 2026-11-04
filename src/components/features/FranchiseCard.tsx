import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radii } from '../../theme';
import { getFranchiseImage } from '../../constants/images';
import { getIndustryIcon } from '../../constants/icons';
import { formatInvestmentRange, formatUSD } from '../../utils/formatters';
import { useFranchiseStore } from '../../stores/useFranchiseStore';
import { Icon } from '../ui/Icon';
import type { Franchise } from '../../types';

interface FranchiseCardProps {
  franchise: Franchise;
  onPress?: () => void;
  showFavorite?: boolean;
}

export function FranchiseCard({ franchise, onPress, showFavorite = true }: FranchiseCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const favorites = useFranchiseStore((s) => s.favorites);
  const toggleFavorite = useFranchiseStore((s) => s.toggleFavorite);
  const showImage = !imageFailed;
  const isFavorite = favorites.includes(franchise.id);

  const onFavorite = () => {
    void toggleFavorite(franchise.id);
  };

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
            <Icon name="business" size={34} color={colors.white} />
          </View>
        )}
        <View style={styles.imageOverlay} />
        {franchise.featured && (
          <View style={styles.featuredBadge}>
            <Icon name="star" size={11} color={colors.primaryDark} />
            <Text style={styles.featuredBadgeText}>Destacada</Text>
          </View>
        )}
        <View style={styles.cityBadge}>
          <Icon name="location" size={11} color={colors.white} />
          <Text style={styles.cityBadgeText}>{franchise.city}</Text>
        </View>
        {showFavorite && (
          <Pressable
            onPress={onFavorite}
            hitSlop={8}
            style={({ pressed }) => [styles.favoriteButton, pressed && { opacity: 0.7 }]}
          >
            <Icon
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? colors.primary : colors.textSecondary}
            />
          </Pressable>
        )}
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
          <View style={styles.metaIndustry}>
            <Icon
              name={getIndustryIcon(franchise.industry)}
              size={13}
              color={colors.textSecondary}
            />
            <Text style={styles.metaText}>{getIndustryLabelShort(franchise.industry)}</Text>
          </View>
          {franchise.estimatedRoi != null && (
            <Text style={styles.roiText}>ROI {franchise.estimatedRoi}</Text>
          )}
        </View>

        <View style={styles.investmentRow}>
          <Icon name="cash-outline" size={13} color={colors.primary} />
          <Text style={styles.investment} numberOfLines={1}>
            {formatInvestmentRange(
              franchise.minInvestment,
              franchise.maxInvestment,
              franchise.currency,
            )}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.viewsRow}>
            <Icon name="eye-outline" size={12} color={colors.textLight} />
            <Text style={styles.views}>{franchise.viewsCount}</Text>
          </View>
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(77,3,20,0.18)',
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accentLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  featuredBadgeText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cityBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(77,3,20,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  cityBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteIcon: {
    fontSize: 16,
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
  metaIndustry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
