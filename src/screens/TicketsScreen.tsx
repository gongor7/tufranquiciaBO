import { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radii } from '../theme';
import { useTicketStore } from '../stores/useTicketStore';
import { SectionTitle } from '../components/ui/SectionTitle';
import { formatRelative } from '../utils/formatters';
import type { Ticket } from '../types';
import type { TabScreenProps } from '../navigation/types';

type Navigation = TabScreenProps<'Tickets'>['navigation'];

export function TicketsScreen() {
  const navigation = useNavigation<Navigation>();
  const tickets = useTicketStore((s) => s.tickets);
  const loading = useTicketStore((s) => s.loading);
  const loadTickets = useTicketStore((s) => s.loadTickets);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const openDetail = (ticket: Ticket) =>
    navigation.navigate('FranchiseDetail', { franchiseId: ticket.franchiseId });

  return (
    <View style={styles.container}>
      <SectionTitle>Solicitudes</SectionTitle>
      <FlatList
        data={tickets}
        keyExtractor={(item) => `ticket-${item.id}`}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => openDetail(item)}>
            <Text style={styles.emoji}>{item.logoEmoji}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{item.franchiseName}</Text>
              <Text style={styles.meta}>
                Enviada {formatRelative(item.createdAt)} · {item.email ?? 'sin correo'}
              </Text>
            </View>
            <View
              style={[
                styles.status,
                item.status === 'atendido' ? styles.statusDone : styles.statusNew,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.status === 'atendido' ? styles.statusDoneText : styles.statusNewText,
                ]}
              >
                {item.status === 'atendido' ? 'Atendida' : 'Nueva'}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📩</Text>
            <Text style={styles.emptyTitle}>Todavía no tenés solicitudes</Text>
            <Text style={styles.emptyText}>
              Cuando pidas información de una oportunidad, la vas a ver aquí con su estado.
            </Text>
          </View>
        }
        refreshing={loading}
        onRefresh={loadTickets}
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  status: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 12,
  },
  statusNew: {
    backgroundColor: 'rgba(179,121,136,0.25)',
  },
  statusNewText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  statusDone: {
    backgroundColor: 'rgba(40,167,69,0.15)',
  },
  statusDoneText: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 12,
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
  },
});
