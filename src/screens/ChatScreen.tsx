import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, spacing, radii } from '../theme';
import { FranchiseRepository } from '../database/repositories/franchise.repository';
import { useMessageStore } from '../stores/useMessageStore';
import { useUserStore } from '../stores/useUserStore';
import { Button } from '../components/ui/Button';
import { formatRelative } from '../utils/formatters';
import type { StackScreenProps } from '../navigation/types';
import type { Franchise, Message } from '../types';

type Props = StackScreenProps<'Chat'>;

export function ChatScreen({ route, navigation }: Props) {
  const { franchiseId } = route.params;
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const listByFranchise = useMessageStore((s) => s.listByFranchise);
  const markAsRead = useMessageStore((s) => s.markAsRead);
  const reply = useMessageStore((s) => s.reply);
  const user = useUserStore((s) => s.user);

  const refresh = useCallback(async () => {
    const [data, msgs] = await Promise.all([
      FranchiseRepository.findById(franchiseId),
      listByFranchise(franchiseId),
    ]);
    setFranchise(data);
    setMessages(msgs);
    await markAsRead(franchiseId);
  }, [franchiseId, listByFranchise, markAsRead]);

  useEffect(() => {
    navigation.setOptions({
      title: franchise?.name ?? 'Conversación',
    });
  }, [navigation, franchise]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const send = async () => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return;
    }
    setText('');
    const sender = user?.name ?? 'Inversionista';
    if (franchise != null) {
      const next: Message = {
        id: Date.now(),
        franchiseId,
        senderName: sender,
        senderEmail: null,
        senderPhone: null,
        message: trimmed,
        isRead: true,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      setMessages((prev) => [...prev, next]);
    }
    await reply(franchiseId, sender, trimmed);
    const msgs = await listByFranchise(franchiseId);
    setMessages(msgs);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => `msg-${item.id}`}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.senderName === (user?.name ?? 'Inversionista') ? styles.bubbleMine : styles.bubbleTheirs,
            ]}
          >
            <Text style={styles.bubbleText}>{item.message}</Text>
            <Text style={styles.bubbleTime}>{formatRelative(item.createdAt)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay mensajes todavía. Envía el primero para iniciar la conversación.
          </Text>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={colors.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
        />
        <Button title="Enviar" size="sm" onPress={() => void send()} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  bubbleMineText: {
    color: colors.white,
  },
  bubbleTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingTop: spacing.xxl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.text,
    maxHeight: 120,
  },
});