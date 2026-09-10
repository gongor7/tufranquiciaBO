import { getExecutor } from '..';

export const FavoriteRepository = {
  async listIds(): Promise<number[]> {
    const rows = await getExecutor().getAll<{ franchise_id: number }>(
      'SELECT franchise_id FROM favorites ORDER BY id DESC',
    );
    return rows.map((row) => row.franchise_id);
  },

  async isFavorite(franchiseId: number): Promise<boolean> {
    const rows = await getExecutor().getAll<{ id: number }>(
      'SELECT id FROM favorites WHERE franchise_id = ?',
      [franchiseId],
    );
    return rows.length > 0;
  },

  async count(): Promise<number> {
    const rows = await getExecutor().getAll<{ total: number }>(
      'SELECT COUNT(*) AS total FROM favorites',
    );
    return rows[0]?.total ?? 0;
  },

  async add(franchiseId: number): Promise<void> {
    await getExecutor().run(
      'INSERT OR IGNORE INTO favorites (franchise_id) VALUES (?)',
      [franchiseId],
    );
  },

  async remove(franchiseId: number): Promise<void> {
    await getExecutor().run('DELETE FROM favorites WHERE franchise_id = ?', [franchiseId]);
  },

  async toggle(franchiseId: number): Promise<boolean> {
    const exists = await this.isFavorite(franchiseId);
    if (exists) {
      await this.remove(franchiseId);
      return false;
    }
    await this.add(franchiseId);
    return true;
  },
};