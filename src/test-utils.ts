import { DatabaseSync } from 'node:sqlite';
import { setExecutor } from './database';
import type { SqlExecutor } from './database/executor';
import { SCHEMA_SQL, SCHEMA_VERSION } from './database/schema';
import { buildSeedRows, MILESTONES_INSERT_SQL } from './database/seed';

function toNumber(value: number | bigint): number {
  return typeof value === 'bigint' ? Number(value) : value;
}

export function createMemoryExecutor(): SqlExecutor {
  const db = new DatabaseSync(':memory:');

  return {
    getAll<T>(sql: string, params: (string | number | null)[] = []): Promise<T[]> {
      const stmt = db.prepare(sql);
      const rows = stmt.all(...params) as unknown as T[];
      return Promise.resolve(rows);
    },
    run(sql: string, params: (string | number | null)[] = []) {
      const info = db.prepare(sql).run(...params);
      return Promise.resolve({
        changes: toNumber(info.changes),
        lastInsertId: toNumber(info.lastInsertRowid),
      });
    },
    exec(sql: string) {
      db.exec(sql);
      return Promise.resolve();
    },
  };
}

export async function createTestDb(options?: { seed?: boolean }): Promise<SqlExecutor> {
  const executor = createMemoryExecutor();
  await executor.exec(SCHEMA_SQL);

  const insertSeed = options?.seed ?? true;
  if (insertSeed) {
    const { sql, params, milestonesByIndex } = buildSeedRows(0);
    for (const [index, row] of params.entries()) {
      const { lastInsertId } = await executor.run(sql, row);
      const franchiseId = lastInsertId ?? 0;
      for (const [position, milestone] of (milestonesByIndex[index] ?? []).entries()) {
        await executor.run(MILESTONES_INSERT_SQL, [
          franchiseId,
          position,
          milestone.title,
          milestone.targetDate ?? null,
          milestone.completed ? 1 : 0,
        ]);
      }
    }
  }

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  await executor.run(
    `INSERT INTO users (name, email, role, created_at, updated_at)
     VALUES ('Inversionista', NULL, 'inversionista', ?, ?)`,
    [now, now],
  );

  await executor.exec(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  setExecutor(executor);
  return executor;
}