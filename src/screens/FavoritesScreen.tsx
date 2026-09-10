import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { FranchiseRepository } from '../database/repositories/franchise.repository';
import { FavoriteRepository } from '../database/repositories/favorite.repository';
import { useFranchiseStore } from '../stores/useFranchiseStore';
import { FranchiseCard } from '../components/features/FranchiseCard';
import { Button } from '../components/ui/Button';
import type { StackScreenProps } from '../navigation/types';
import type { Franchise } from '../types';

type Props = StackScreenProps<'Favorites'>;

export function FavoritesScreen({ navigation }: Props) {
  const [favoriteList, setFavoriteList] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const favorites = useFranchiseStore((s) => s.favorites);
  const loadFavorites = useFranchiseStore((s) => s.loadFavorites);

  useEffect(() => {
    let active = true;
    void (async () => {
      await loadFavorites();
      const ids = await FavoriteRepository.listIds();
      const all = await FranchiseRepository.findAll({ sortBy: 'recent' });
      if (active) {
        setFavoriteList(all.filter((f) => ids.includes(f.id)));
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadFavorites, favorites.length]);

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteList}
        keyExtractor={(item) => `fav-${item.id}`}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <FranchiseCard
            franchise={item}
            onPress={() => navigation.navigate('FranchiseDetail', { franchiseId: item.id })}
          />
        )}
        ListHeaderComponent={<Text style={styles.title}>Mis favoritos</Text>}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🤍</Text>
              <Text style={styles.emptyTitle}>Aún no tienes favoritos</Text>
              <Text style={styles.emptyText}>
                Toca el corazón en cualquier franquicia para guardarla aquí y compararla luego.
              </Text>
              <Button title="Explorar franquicias" onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })} />
            </View>
          )
        }
      />
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
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
    paddingHorizontal: spacing.lg,
  },
});