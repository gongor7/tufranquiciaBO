import { useEffect } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radii, typography } from '../theme';
import { industries, getIndustry } from '../constants';
import { useFranchiseStore } from '../stores/useFranchiseStore';
import { FranchiseCard } from '../components/features/FranchiseCard';
import { Chip } from '../components/ui/Chip';
import { SectionTitle } from '../components/ui/SectionTitle';
import type { TabScreenProps } from '../navigation/types';
import type { Franchise } from '../types';

type Navigation = TabScreenProps<'Home'>['navigation'];

export function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const featured = useFranchiseStore((s) => s.featured);
  const popular = useFranchiseStore((s) => s.popular);
  const loadFeatured = useFranchiseStore((s) => s.loadFeatured);
  const loadPopular = useFranchiseStore((s) => s.loadPopular);
  const setTextFilter = useFranchiseStore((s) => s.setFilters);

  useEffect(() => {
    void loadFeatured();
    void loadPopular();
  }, [loadFeatured, loadPopular]);

  const hero = featured[0];
  const openDetail = (franchise: Franchise) =>
    navigation.navigate('FranchiseDetail', { franchiseId: franchise.id });

  const openIndustry = (industry: string) => {
    useFranchiseStore.setState((s) => ({ filters: { ...s.filters, industry, text: undefined } }));
    navigation.navigate('Explore');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionTitle>Inicio</SectionTitle>

        <TextInput
          style={styles.search}
          placeholder="Buscar franquicias..."
          placeholderTextColor={colors.textSecondary}
          onChangeText={(text) => setTextFilter({ text })}
        />

        {hero != null && (
          <Pressable style={styles.banner} onPress={() => openDetail(hero)}>
            <Text style={styles.bannerEmoji}>{hero.logoEmoji}</Text>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTag}>Destacada</Text>
              <Text style={styles.bannerName}>{hero.name}</Text>
              <Text style={styles.bannerSub} numberOfLines={2}>
                {hero.tagline}
              </Text>
            </View>
          </Pressable>
        )}

        <Text style={styles.subtitle}>Categorías</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -spacing.md }}
        >
          <View style={styles.categories}>
            {industries.map((industry) => (
              <Chip
                key={industry.id}
                label={industry.label}
                emoji={getIndustry(industry.id)?.emoji}
                onPress={() => openIndustry(industry.id)}
              />
            ))}
          </View>
        </ScrollView>

        <Text style={styles.subtitle}>Populares</Text>
        <FlatList
          key="popular"
          data={popular}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => `popular-${item.id}`}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <FranchiseCard franchise={item} onPress={() => openDetail(item)} />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>En este momento no hay franquicias populares.</Text>
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
  search: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  bannerEmoji: {
    fontSize: 48,
    marginRight: spacing.md,
  },
  bannerText: {
    flex: 1,
  },
  bannerTag: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bannerName: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  bannerSub: {
    color: '#DDE7F0',
    fontSize: 14,
    marginTop: 4,
  },
  subtitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  cardWrapper: {
    width: 260,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingVertical: spacing.md,
  },
});