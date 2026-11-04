import { getExecutor } from '..';
import { UserRepository } from './user.repository';
import type { Ticket, TicketStatus } from '../../types';

interface TicketRow {
  id: number;
  franchise_id: number;
  franchise_name: string;
  logo_emoji: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
}

function mapTicketRow(row: TicketRow): Ticket {
  return {
    id: row.id,
    franchiseId: row.franchise_id,
    franchiseName: row.franchise_name,
    logoEmoji: row.logo_emoji,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    status: row.status as TicketStatus,
    createdAt: row.created_at,
  };
}

const BASE_SELECT = `
  SELECT t.id, t.franchise_id, f.name AS franchise_name, f.logo_emoji,
         t.full_name, t.email, t.phone, t.status, t.created_at
  FROM tickets t
  JOIN franchises f ON f.id = t.franchise_id
`;

export const TicketRepository = {
  /** Crea una solicitud con los datos del perfil activo, sin formulario (RF-40). */
  async createFromProfile(franchiseId: number): Promise<Ticket> {
    const profile = await UserRepository.getProfile();
    const fullName = profile?.fullName ?? profile?.name ?? 'Usuario';
    const result = await getExecutor().run(
      `INSERT INTO tickets (franchise_id, full_name, email, phone, status)
       VALUES (?, ?, ?, ?, 'nuevo')`,
      [franchiseId, fullName, profile?.email ?? null, profile?.phone ?? null],
    );
    await getExecutor().run(
      'UPDATE franchises SET inquiries_count = inquiries_count + 1 WHERE id = ?',
      [franchiseId],
    );
    const rows = await getExecutor().getAll<TicketRow>(`${BASE_SELECT} WHERE t.id = ?`, [
      result.lastInsertId ?? 0,
    ]);
    return mapTicketRow(rows[0]);
  },

  async list(): Promise<Ticket[]> {
    const rows = await getExecutor().getAll<TicketRow>(
      `${BASE_SELECT} ORDER BY t.id DESC`,
    );
    return rows.map(mapTicketRow);
  },

  async countByStatus(status: TicketStatus): Promise<number> {
    const rows = await getExecutor().getAll<{ total: number }>(
      'SELECT COUNT(*) AS total FROM tickets WHERE status = ?',
      [status],
    );
    return rows[0]?.total ?? 0;
  },

  async markAttended(id: number): Promise<void> {
    await getExecutor().run("UPDATE tickets SET status = 'atendido' WHERE id = ?", [id]);
  },
};
