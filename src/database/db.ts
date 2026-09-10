import * as SQLite from 'expo-sqlite';
import { createNativeExecutor, SqlExecutor } from './executor';
import { SCHEMA_SQL, COUNT_FRANCHISES_SQL, COUNT_USERS_SQL } from './schema';
import { buildSeedRows } from './seed';
import { setExecutor } from './index';

export const DB_NAME = 'tufranquiciabo.db';

async function ensureSchema(executor: SqlExecutor): Promise<void> {
  await executor.exec(SCHEMA_SQL);
}

async function ensureSeed(executor: SqlExecutor): Promise<void> {
  const franchiseCount = await executor.getAll<{ total: number }>(COUNT_FRANCHISES_SQL);
  if (franchiseCount[0]?.total === 0) {
    const { sql, params } = buildSeedRows(0);
    for (const row of params) {
      await executor.run(sql, row);
    }
  }

  const userCount = await executor.getAll<{ total: number }>(COUNT_USERS_SQL);
  if (userCount[0]?.total === 0) {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    await executor.run(
      `INSERT INTO users (name, email, role, created_at, updated_at)
       VALUES ('Inversionista', NULL, 'inversionista', ?, ?)`,
      [now, now],
    );
  }
}

export async function initDatabase(): Promise<SqlExecutor> {
  try {
    const nativeDb = await SQLite.openDatabaseAsync(DB_NAME);
    const executor = createNativeExecutor(nativeDb);
    await ensureSchema(executor);
    await ensureSeed(executor);
    setExecutor(executor);
    return executor;
  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
    const nativeDb = await SQLite.openDatabaseAsync(DB_NAME);
    const executor = createNativeExecutor(nativeDb);
    await executor.exec('DROP TABLE IF EXISTS messages; DROP TABLE IF EXISTS favorites; DROP TABLE IF EXISTS onboarding_completed; DROP TABLE IF EXISTS franchises; DROP TABLE IF EXISTS users;');
    await ensureSchema(executor);
    await ensureSeed(executor);
    setExecutor(executor);
    return executor;
  }
}