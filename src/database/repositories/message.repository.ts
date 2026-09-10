import { getExecutor } from '..';
import type { ContactMessageDTO, Conversation, Message } from '../../types';

interface MessageRow {
  id: number;
  franchise_id: number;
  sender_name: string;
  sender_email: string | null;
  sender_phone: string | null;
  message: string;
  is_read: number;
  created_at: string;
}

interface ConversationRow {
  franchise_id: number;
  franchise_name: string;
  logo_emoji: string;
  last_message: string;
  last_activity: string;
  unread_count: number;
}

function mapMessageRow(row: MessageRow): Message {
  return {
    id: row.id,
    franchiseId: row.franchise_id,
    senderName: row.sender_name,
    senderEmail: row.sender_email,
    senderPhone: row.sender_phone,
    message: row.message,
    isRead: row.is_read === 1,
    createdAt: row.created_at,
  };
}

export const MessageRepository = {
  async createContactMessage(dto: ContactMessageDTO): Promise<Message> {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const result = await getExecutor().run(
      `INSERT INTO messages (franchise_id, sender_name, sender_email, sender_phone, message, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [dto.franchiseId, dto.senderName, dto.senderEmail || null, dto.senderPhone || null, dto.message, now],
    );
    await getExecutor().run(
      'UPDATE franchises SET inquiries_count = inquiries_count + 1 WHERE id = ?',
      [dto.franchiseId],
    );
    const rows = await getExecutor().getAll<MessageRow>(
      'SELECT * FROM messages WHERE id = ?',
      [result.lastInsertId ?? 0],
    );
    return mapMessageRow(rows[0]);
  },

  async listConversations(): Promise<Conversation[]> {
    const rows = await getExecutor().getAll<ConversationRow>(
      `SELECT
         m.franchise_id,
         fr.name AS franchise_name,
         fr.logo_emoji AS logo_emoji,
         (SELECT m2.message FROM messages m2
           WHERE m2.franchise_id = m.franchise_id
           ORDER BY m2.id DESC LIMIT 1) AS last_message,
         MAX(m.created_at) AS last_activity,
         SUM(CASE WHEN m.is_read = 0 THEN 1 ELSE 0 END) AS unread_count
       FROM messages m
       JOIN franchises fr ON fr.id = m.franchise_id
       GROUP BY m.franchise_id
       ORDER BY last_activity DESC`,
    );
    return rows.map((row) => ({
      franchiseId: row.franchise_id,
      franchiseName: row.franchise_name,
      logoEmoji: row.logo_emoji,
      lastMessage: row.last_message,
      lastActivity: row.last_activity,
      unreadCount: row.unread_count,
    }));
  },

  async listByFranchise(franchiseId: number): Promise<Message[]> {
    const rows = await getExecutor().getAll<MessageRow>(
      'SELECT * FROM messages WHERE franchise_id = ? ORDER BY id ASC',
      [franchiseId],
    );
    return rows.map(mapMessageRow);
  },

  async markAsRead(franchiseId: number): Promise<void> {
    await getExecutor().run(
      'UPDATE messages SET is_read = 1 WHERE franchise_id = ?',
      [franchiseId],
    );
  },

  async addReply(franchiseId: number, senderName: string, text: string): Promise<Message> {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const result = await getExecutor().run(
      `INSERT INTO messages (franchise_id, sender_name, message, is_read, created_at)
       VALUES (?, ?, ?, 1, ?)`,
      [franchiseId, senderName, text, now],
    );
    const rows = await getExecutor().getAll<MessageRow>(
      'SELECT * FROM messages WHERE id = ?',
      [result.lastInsertId ?? 0],
    );
    return mapMessageRow(rows[0]);
  },

  async countUnread(): Promise<number> {
    const rows = await getExecutor().getAll<{ total: number }>(
      'SELECT COUNT(*) AS total FROM messages WHERE is_read = 0',
    );
    return rows[0]?.total ?? 0;
  },
};