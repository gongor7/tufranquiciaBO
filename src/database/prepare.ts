import { SCHEMA_SQL, SCHEMA_VERSION, COUNT_FRANCHISES_SQL, COUNT_USERS_SQL } from './schema';
import { buildSeedRows, MILESTONES_INSERT_SQL } from './seed';
import type { SqlExecutor } from './executor';

const DROP_TABLES_SQL = `
DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS onboarding_completed;
DROP TABLE IF EXISTS franchises;
DROP TABLE IF EXISTS users;
`;

async function getVersion(executor: SqlExecutor): Promise<number> {
  const rows = await executor.getAll<{ user_version: number }>('PRAGMA user_version;');
  return rows[0]?.user_version ?? 0;
}

/**
 * Garantiza esquema en la versión actual + seed de 28 oportunidades.
 * Si la base es de una versión anterior (o está corrupta) se reconstruye
 * con el seed inicial, sin exponer errores al usuario (spec 001 RF-25,
 * spec 002 RF-35).
 */
export async function prepareDatabase(executor: SqlExecutor): Promise<void> {
  const version = await getVersion(executor);
  if (version < SCHEMA_VERSION) {
    await executor.exec(DROP_TABLES_SQL);
  }
  try {
    await executor.exec(SCHEMA_SQL);
  } catch (error) {
    console.error('Esquema corrupto, reconstruyendo base de datos:', error);
    await executor.exec(DROP_TABLES_SQL);
    await executor.exec(SCHEMA_SQL);
  }
  await executor.exec(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  await ensureSeed(executor);
}

async function ensureSeed(executor: SqlExecutor): Promise<void> {
  const franchiseCount = await executor.getAll<{ total: number }>(COUNT_FRANCHISES_SQL);
  if (franchiseCount[0]?.total === 0) {
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
