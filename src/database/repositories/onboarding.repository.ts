import { getExecutor } from '..';

export const OnboardingRepository = {
  async isCompleted(): Promise<boolean> {
    const rows = await getExecutor().getAll<{ completed: number }>(
      'SELECT completed FROM onboarding_completed WHERE id = 1',
    );
    return rows.length > 0 && rows[0].completed === 1;
  },

  async setCompleted(): Promise<void> {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    await getExecutor().run(
      `INSERT OR REPLACE INTO onboarding_completed (id, completed, completed_at)
       VALUES (1, 1, ?)`,
      [now],
    );
  },
};