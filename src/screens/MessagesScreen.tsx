import { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radii } from '../theme';
import { useMessageStore } from '../stores/useMessageStore';
import { SectionTitle } from '../components/ui/SectionTitle';
import { formatRelative } from '../utils/formatters';
import type { TabScreenProps } from '../navigation/types';

type Props = TabScreenProps<'Messages'>;

export function MessagesScreen({ navigation }: Props) {
  const conversations = useMessageStore((s) => s.conversations);
  const loadConversations = useMessageStore((s) => s.loadConversations);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      void loadConversations();
    });
    void loadConversations();
    return unsubscribe;
  }, [navigation, loadConversations]);

  return (
    <View style={styles.container}>
      <SectionTitle>Mensajes</SectionTitle>
      <FlatList
        data={conversations}
        keyExtractor={(item) => `conv-${item.franchiseId}`}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('Chat', { franchiseId: item.franchiseId })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.logoEmoji}</Text>
            </View>
            <View style={styles.info}>
              <View style={styles.topLine}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.franchiseName}
                </Text>
                <Text style={styles.time}>{formatRelative(item.lastActivity)}</Text>
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.unreadCount > 0 && <Text style={styles.unread}>{`${item.unreadCount} · `}</Text>}
                {item.lastMessage}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>No tienes conversaciones</Text>
            <Text style={styles.emptyText}>
              Contacta a alguna franquicia y su respuesta aparecerá aquí.
            </Text>
          </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  unread: {
    color: colors.primary,
    fontWeight: '800',
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
    paddingHorizontal: spacing.lg,
  },
});