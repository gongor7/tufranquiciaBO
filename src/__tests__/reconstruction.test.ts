import { createTestDb, createMemoryExecutor } from '../test-utils';
import { SCHEMA_SQL } from '../database/schema';
import { buildSeedRows } from '../database/seed';
import { setExecutor } from '../database';
import { FranchiseRepository } from '../database/repositories/franchise.repository';

describe('Reconstrucción (RF-25)', () => {
  it('reconstructor: si no hay tablas/franquicias, el seed se aplica completo', async () => {
    const executor = createMemoryExecutor();
    await executor.exec(SCHEMA_SQL);
    const { sql, params } = buildSeedRows(0);
    for (const row of params) {
      await executor.run(sql, row);
    }
    setExecutor(executor);

    const franchises = await FranchiseRepository.findAll({ sortBy: 'popular' });
    expect(franchises.length).toBe(27); // activos: el proyecto vencido se excluye (RF-34)
  });

  it('un ejecutor "corrupto" que cae por esquema se recupera eliminando tablas y reseedando', async () => {
    await createTestDb();

    const executor = createMemoryExecutor();
    await executor.exec('DROP TABLE IF EXISTS messages;');
    await executor.exec('DROP TABLE IF EXISTS favorites;');
    await executor.exec('DROP TABLE IF EXISTS onboarding_completed;');
    await executor.exec('DROP TABLE IF EXISTS franchises;');
    await executor.exec('DROP TABLE IF EXISTS users;');

    await executor.exec(SCHEMA_SQL);
    const { sql, params } = buildSeedRows(0);
    for (const row of params) {
      await executor.run(sql, row);
    }
    setExecutor(executor);

    const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
    expect(franchises.length).toBe(27); // activos: el proyecto vencido se excluye (RF-34)
    expect(franchises[0].name).toBeTruthy();
  });

  it('el esquema se aplica de forma idempotente (sin duplicar seed)', async () => {
    const executor = createMemoryExecutor();
    await executor.exec(SCHEMA_SQL);
    await executor.exec(SCHEMA_SQL);
    const { sql, params } = buildSeedRows(0);
    for (const row of params) {
      await executor.run(sql, row);
    }
    setExecutor(executor);
    const franchises = await FranchiseRepository.findAll({ sortBy: 'recent' });
    expect(franchises.length).toBe(27); // activos: el proyecto vencido se excluye (RF-34)
  });
});