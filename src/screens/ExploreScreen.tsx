import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme';
import { departments } from '../constants';
import { SEGMENTS } from '../constants/segments';
import { SEGMENT_ICONS } from '../constants/icons';
import { useFranchiseStore } from '../stores/useFranchiseStore';
import { FranchiseCard } from '../components/features/FranchiseCard';
import { Chip } from '../components/ui/Chip';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import type { TabScreenProps } from '../navigation/types';
import type { Franchise, Segment as Segments, SortBy } from '../types';

type Navigation = TabScreenProps<'Explore'>['navigation'];

const sortOptions: { label: string; value: SortBy }[] = [
  { label: 'Recientes', value: 'recent' },
  { label: 'Populares', value: 'popular' },
];

export function ExploreScreen() {
  const navigation = useNavigation<Navigation>();
  const franchises = useFranchiseStore((s) => s.franchises);
  const filters = useFranchiseStore((s) => s.filters);
  const loading = useFranchiseStore((s) => s.loading);
  const loadFranchises = useFranchiseStore((s) => s.loadFranchises);
  const loadFavorites = useFranchiseStore((s) => s.loadFavorites);
  const setFilters = useFranchiseStore((s) => s.setFilters);
  const clearFilters = useFranchiseStore((s) => s.clearFilters);

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    void loadFranchises();
    void loadFavorites();
  }, [loadFranchises, loadFavorites]);

  const activeFilters =
    (filters.department ? 1 : 0) + (filters.segments?.length ? 1 : 0);

  const openDetail = (franchise: Franchise) =>
    navigation.navigate('FranchiseDetail', { franchiseId: franchise.id });

  const toggleSegment = (segment: Segments) => {
    const current = filters.segments ?? [];
    const next = current.includes(segment)
      ? current.filter((s) => s !== segment)
      : [...current, segment];
    setFilters({ segments: next.length > 0 ? next : undefined });
  };

  const toggleDepartment = (department: string) => {
    const next = filters.department === department ? undefined : department;
    setFilters({ department: next });
  };

  return (
    <View style={styles.container}>
      <SectionTitle>Explorar</SectionTitle>

      <View style={styles.sortRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SEGMENTS.map((segment) => (
            <Chip
              key={segment.id}
              label={segment.label}
              icon={SEGMENT_ICONS[segment.id]}
              selected={(filters.segments ?? []).includes(segment.id)}
              onPress={() => toggleSegment(segment.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.sortRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sortOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={filters.sortBy === option.value}
              onPress={() => setFilters({ sortBy: option.value })}
            />
          ))}
          <Chip
            label="Departamento"
            selected={showFilters}
            onPress={() => setShowFilters((v) => !v)}
          />
        </ScrollView>
      </View>

      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Departamento</Text>
          <View style={styles.chipWrap}>
            {departments.map((department) => (
              <Chip
                key={department}
                label={department}
                selected={filters.department === department}
                onPress={() => toggleDepartment(department)}
              />
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={franchises}
        key="explore"
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        keyExtractor={(item) => `explore-${item.id}`}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <View style={styles.gridCell}>
            <FranchiseCard franchise={item} onPress={() => openDetail(item)} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon
              name={activeFilters > 0 ? 'search-outline' : 'business-outline'}
              size={48}
              color={colors.textLight}
            />
            <Text style={styles.emptyTitle}>No hay oportunidades para mostrar</Text>
            <Text style={styles.emptyText}>
              {activeFilters > 0
                ? 'Prueba con otros filtros o limpia la búsqueda.'
                : 'Aún no se han registrado oportunidades.'}
            </Text>
            {activeFilters > 0 && (
              <Button title="Limpiar filtros" variant="outline" onPress={clearFilters} />
            )}
          </View>
        }
        refreshing={loading}
        onRefresh={loadFranchises}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.lg,
  },
  sortRow: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  filterPanel: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  filterLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  gridCell: {
    flex: 1,
    maxWidth: '50%',
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});
