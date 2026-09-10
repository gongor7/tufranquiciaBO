import { getExecutor } from '..';
import type { ProfileUpdateDTO, Role, User } from '../../types';

interface UserRow {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role as Role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const UserRepository = {
  async getProfile(): Promise<User | null> {
    const rows = await getExecutor().getAll<UserRow>(
      'SELECT * FROM users ORDER BY id ASC LIMIT 1',
    );
    return rows.length > 0 ? mapUserRow(rows[0]) : null;
  },

  async createDefaultProfile(): Promise<User> {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const result = await getExecutor().run(
      `INSERT INTO users (name, email, role, created_at, updated_at)
       VALUES ('Inversionista', NULL, 'inversionista', ?, ?)`,
      [now, now],
    );
    const rows = await getExecutor().getAll<UserRow>(
      'SELECT * FROM users WHERE id = ?',
      [result.lastInsertId ?? 1],
    );
    return mapUserRow(rows[0]);
  },

  async updateProfile(id: number, dto: ProfileUpdateDTO): Promise<User> {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    await getExecutor().run(
      'UPDATE users SET name = ?, email = ?, phone = ?, role = ?, updated_at = ? WHERE id = ?',
      [dto.name, dto.email || null, dto.phone || null, dto.role, now, id],
    );
    const rows = await getExecutor().getAll<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
    return mapUserRow(rows[0]);
  },

  async isFranquiciador(): Promise<boolean> {
    const profile = await this.getProfile();
    if (!profile) {
      return false;
    }
    return profile.role === 'franquiciador';
  },
};