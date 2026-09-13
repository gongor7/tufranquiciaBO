import { useEffect } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radii, typography } from '../theme';
import { industries } from '../constants';
import { SEGMENTS } from '../constants/segments';
import { getFranchiseImage } from '../constants/images';
import { useFranchiseStore } from '../stores/useFranchiseStore';
import { FranchiseCard } from '../components/features/FranchiseCard';
import type { TabScreenProps } from '../navigation/types';
import type { Franchise, Segment as SegmentId } from '../types';

type Navigation = TabScreenProps<'Home'>['navigation'];

export function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const featured = useFranchiseStore((s) => s.featured);
  const popular = useFranchiseStore((s) => s.popular);
  const franchises = useFranchiseStore((s) => s.franchises);
  const loadFeatured = useFranchiseStore((s) => s.loadFeatured);
  const loadPopular = useFranchiseStore((s) => s.loadPopular);
  const loadFranchises = useFranchiseStore((s) => s.loadFranchises);
  const setTextFilter = useFranchiseStore((s) => s.setFilters);

  useEffect(() => {
    void loadFeatured();
    void loadPopular();
    void loadFranchises();
  }, [loadFeatured, loadPopular, loadFranchises]);

  const hero = featured[0];
  const openDetail = (franchise: Franchise) =>
    navigation.navigate('FranchiseDetail', { franchiseId: franchise.id });

  const openExplore = () => navigation.navigate('Explore');

  const openIndustry = (industry: string) => {
    useFranchiseStore.setState((s) => ({ filters: { ...s.filters, industry, text: undefined } }));
    navigation.navigate('Explore');
  };

  const openSegment = (segment: SegmentId) => {
    useFranchiseStore.setState((s) => ({
      filters: { ...s.filters, segments: [segment], industry: undefined, text: undefined },
    }));
    navigation.navigate('Explore');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bienvenido 👋</Text>
            <Text style={styles.headerTitle}>Encuentra tu próxima inversión en Bolivia</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeCount}>{franchises.length}</Text>
            <Text style={styles.headerBadgeLabel}>oportunidades</Text>
          </View>
        </View>

        <Pressable onPress={openExplore} style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.search}
            placeholder="Buscar por nombre, ciudad o rubro..."
            placeholderTextColor={colors.textSecondary}
            onChangeText={(text) => setTextFilter({ text })}
          />
        </Pressable>

        {hero != null && (
          <Pressable style={styles.banner} onPress={() => openDetail(hero)}>
            <Image
              source={{ uri: getFranchiseImage(hero.slug) }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.bannerOverlay} />
            <View style={styles.bannerContent}>
              <View style={styles.bannerTags}>
                <Text style={styles.bannerTag}>★ OPORTUNIDAD DESTACADA</Text>
              </View>
              <Text style={styles.bannerName} numberOfLines={1}>
                {hero.logoEmoji} {hero.name}
              </Text>
              <Text style={styles.bannerSub} numberOfLines={2}>
                {hero.tagline}
              </Text>
              <Text style={styles.bannerCity}>📍 {hero.city}, {hero.department}</Text>
            </View>
          </Pressable>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.subtitle}>Invierte por segmento</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -spacing.md }}
          contentContainerStyle={styles.categories}
        >
          {SEGMENTS.map((segment) => (
            <Pressable
              key={segment.id}
              style={({ pressed }) => [styles.categoryTile, pressed && styles.pressedTile]}
              onPress={() => openSegment(segment.id)}
            >
              <View style={styles.categoryEmoji}>
                <Text style={styles.categoryEmojiText}>{segment.emoji}</Text>
              </View>
              <Text style={styles.categoryLabel} numberOfLines={2}>
                {segment.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.subtitle}>Explora por categoría</Text>
          <Pressable onPress={openExplore}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -spacing.md }}
          contentContainerStyle={styles.categories}
        >
          {industries.map((industry) => (
            <Pressable
              key={industry.id}
              style={({ pressed }) => [styles.categoryTile, pressed && styles.pressedTile]}
              onPress={() => openIndustry(industry.id)}
            >
              <View style={styles.categoryEmoji}>
                <Text style={styles.categoryEmojiText}>{industry.emoji}</Text>
              </View>
              <Text style={styles.categoryLabel} numberOfLines={2}>
                {industry.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.subtitle}>Las más consultadas</Text>
          <Pressable onPress={openExplore}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </Pressable>
        </View>
        <FlatList
          key="popular"
          data={popular.slice(0, 8)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => `popular-${item.id}`}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <FranchiseCard franchise={item} onPress={() => openDetail(item)} />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>En este momento no hay oportunidades populares.</Text>
          }
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.primaryDark,
    marginTop: 2,
    flexShrink: 1,
  },
  headerBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  headerBadgeCount: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '800',
  },
  headerBadgeLabel: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  search: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: colors.text,
  },
  banner: {
    height: 190,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    justifyContent: 'flex-end',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11,37,69,0.62)',
  },
  bannerContent: {
    padding: spacing.lg,
  },
  bannerTags: {
    flexDirection: 'row',
  },
  bannerTag: {
    color: colors.accent,
    backgroundColor: 'rgba(11,37,69,0.55)',
    fontWeight: '800',
    fontSize: 11,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    letterSpacing: 1,
    overflow: 'hidden',
  },
  bannerName: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  bannerSub: {
    color: '#DDE7F0',
    fontSize: 14,
    marginTop: 4,
  },
  bannerCity: {
    color: colors.accentLight,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.h3,
    color: colors.text,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  categoryTile: {
    width: 84,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  categoryEmoji: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryEmojiText: {
    fontSize: 28,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  pressedTile: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  cardWrapper: {
    width: 240,
    marginRight: spacing.md,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingVertical: spacing.md,
  },
});
