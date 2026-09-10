import { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radii, typography } from '../theme';
import { departments, industries, getIndustry } from '../constants';
import { useFranchiseStore } from '../stores/useFranchiseStore';
import { FranchiseCard } from '../components/features/FranchiseCard';
import { Chip } from '../components/ui/Chip';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Button } from '../components/ui/Button';
import type { TabScreenProps } from '../navigation/types';
import type { Franchise, SortBy } from '../types';

type Navigation = TabScreenProps<'Explore'>['navigation'];

const sortOptions: { label: string; value: SortBy }[] = [
  { label: 'Recientes', value: 'recent' },
  { label: 'Populares', value: 'popular' },
  { label: 'Menor inversión', value: 'investment' },
  { label: 'Mayor inversión', value: 'investmentDesc' },
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
  const [minText, setMinText] = useState('');
  const [maxText, setMaxText] = useState('');

  useEffect(() => {
    void loadFranchises();
    void loadFavorites();
  }, [loadFranchises, loadFavorites]);

  const activeFilters =
    (filters.industry ? 1 : 0) +
    (filters.department ? 1 : 0) +
    (filters.minInvestment != null ? 1 : 0) +
    (filters.maxInvestment != null ? 1 : 0);

  const openDetail = (franchise: Franchise) =>
    navigation.navigate('FranchiseDetail', { franchiseId: franchise.id });

  const toggleIndustry = (industry: string) => {
    const next = filters.industry === industry ? undefined : industry;
    setFilters({ industry: next });
  };

  const toggleDepartment = (department: string) => {
    const next = filters.department === department ? undefined : department;
    setFilters({ department: next });
  };

  const applyBudget = () => {
    const minValue = Number(minText);
    const maxValue = Number(maxText);
    setFilters({
      minInvestment: Number.isFinite(minValue) && minValue > 0 ? minValue : undefined,
      maxInvestment: Number.isFinite(maxValue) && maxValue > 0 ? maxValue : undefined,
    });
  };

  const displayData = useMemo(() => franchises, [franchises]);

  return (
    <View style={styles.container}>
      <SectionTitle>Explorar</SectionTitle>

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
            label="Filtros"
            selected={showFilters}
            onPress={() => setShowFilters((v) => !v)}
          />
        </ScrollView>
      </View>

      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Categorías</Text>
          <View style={styles.chipWrap}>
            {industries.map((industry) => (
              <Chip
                key={industry.id}
                label={industry.label}
                emoji={getIndustry(industry.id)?.emoji}
                selected={filters.industry === industry.id}
                onPress={() => toggleIndustry(industry.id)}
              />
            ))}
          </View>

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

          <Text style={styles.filterLabel}>Rango de inversión (USD)</Text>
          <View style={styles.budgetRow}>
            <TextInput
              style={styles.budgetInput}
              placeholder="Mín"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={minText}
              onChangeText={setMinText}
            />
            <Text style={styles.budgetDash}>—</Text>
            <TextInput
              style={styles.budgetInput}
              placeholder="Máx"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={maxText}
              onChangeText={setMaxText}
            />
            <Button title="Aplicar" size="sm" variant="outline" onPress={applyBudget} style={{ width: undefined }} />
          </View>
        </View>
      )}

      <FlatList
        data={displayData}
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
            <Text style={styles.emptyEmoji}>{showFilters || activeFilters > 0 ? '🔍' : '🏪'}</Text>
            <Text style={styles.emptyTitle}>No hay franquicias para mostrar</Text>
            <Text style={styles.emptyText}>
              {activeFilters > 0
                ? 'Prueba con otros filtros o limpia la búsqueda.'
                : 'Aún no se han registrado franquicias.'}
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
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
  },
  budgetDash: {
    marginHorizontal: spacing.sm,
    color: colors.textSecondary,
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