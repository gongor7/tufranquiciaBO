import { prepareDatabase } from '../database/prepare';
import { SCHEMA_VERSION } from '../database/schema';
import { createMemoryExecutor } from '../test-utils';

async function countBySegment(
  executor: ReturnType<typeof createMemoryExecutor>,
): Promise<Record<string, number>> {
  const rows = await executor.getAll<{ segment: string; total: number }>(
    'SELECT segment, COUNT(*) AS total FROM franchises GROUP BY segment;',
  );
  return Object.fromEntries(rows.map((r) => [r.segment, r.total]));
}

describe('T17: esquema y seed multisegmento', () => {
  it('siembra 28 oportunidades repartidas por segmento (RF-35)', async () => {
    const executor = createMemoryExecutor();
    await prepareDatabase(executor);

    const counts = await countBySegment(executor);
    expect(counts['franquicia']).toBe(20);
    expect(counts['sociedad']).toBe(4);
    expect(counts['proyecto']).toBe(2);
    expect(counts['mipe']).toBe(2);
  });

  it('asigna subtipos válidos por segmento (RF-28)', async () => {
    const executor = createMemoryExecutor();
    await prepareDatabase(executor);

    const sociedades = await executor.getAll<{ subtype: string }>(
      "SELECT subtype FROM franchises WHERE segment = 'sociedad';",
    );
    const subtipos = sociedades.map((s) => s.subtype).sort();
    expect(subtipos).toEqual(['sa', 'srl', 'srl', 'sa'].sort());

    const franquicias = await executor.getAll<{ subtype: string }>(
      "SELECT DISTINCT subtype FROM franchises WHERE segment = 'franquicia' AND subtype IS NOT NULL;",
    );
    for (const f of franquicias) {
      expect(['individual', 'departamental', 'nacional']).toContain(f.subtype);
    }
  });

  it('siembra un proyecto vigente y uno vencido (RF-34)', async () => {
    const executor = createMemoryExecutor();
    await prepareDatabase(executor);

    const rows = await executor.getAll<{ project_end: string }>(
      "SELECT project_end FROM franchises WHERE segment = 'proyecto' ORDER BY project_end;",
    );
    expect(rows).toHaveLength(2);
    const today = new Date().toISOString().slice(0, 10);
    expect(rows[0].project_end < today).toBe(true);
    expect(rows[1].project_end > today).toBe(true);
  });

  it('siembra MIPEs con perfil completo: etapa, pitch, video, plan e hitos (RF-30, RF-35)', async () => {
    const executor = createMemoryExecutor();
    await prepareDatabase(executor);

    const mipes = await executor.getAll<{
      mipe_stage: string;
      pitch: string;
      video_url: string;
      formalization_plan: string;
    }>("SELECT mipe_stage, pitch, video_url, formalization_plan FROM franchises WHERE segment = 'mipe';");
    expect(mipes).toHaveLength(2);
    for (const m of mipes) {
      expect(['idea', 'validado', 'operativo']).toContain(m.mipe_stage);
      expect(m.pitch.length).toBeGreaterThan(0);
      expect(m.video_url).toMatch(/^https?:\/\//);
      expect(m.formalization_plan.length).toBeGreaterThan(0);
    }

    const hitos = await executor.getAll<{ total: number }>(
      'SELECT COUNT(*) AS total FROM milestones;',
    );
    expect(hitos[0].total).toBeGreaterThanOrEqual(4);
  });

  it('admite min_investment = 0 para MIPE sin monto (RF-33)', async () => {
    const executor = createMemoryExecutor();
    await prepareDatabase(executor);

    const rows = await executor.getAll<{ min_investment: number }>(
      "SELECT min_investment FROM franchises WHERE segment = 'mipe';",
    );
    expect(rows.some((r) => r.min_investment === 0)).toBe(true);
  });

  it('reconstruye la base cuando la versión del esquema es anterior (RF-25, RF-35)', async () => {
    const executor = createMemoryExecutor();
    await executor.exec(`
      CREATE TABLE franchises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        industry TEXT NOT NULL,
        department TEXT NOT NULL,
        city TEXT NOT NULL,
        min_investment REAL NOT NULL,
        max_investment REAL NOT NULL,
        contact_name TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        status TEXT DEFAULT 'activa',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      );
      PRAGMA user_version = 1;
    `);
    await executor.run(
      `INSERT INTO franchises (name, slug, description, industry, department, city,
        min_investment, max_investment, contact_name, contact_email, status,
        created_at, updated_at)
       VALUES ('Vieja', 'vieja', 'x', 'comida', 'La Paz', 'La Paz', 1, 2,
        'A', 'a@a.bo', 'activa', '2020-01-01', '2020-01-01');`,
    );

    await prepareDatabase(executor);

    const counts = await countBySegment(executor);
    expect(counts['franquicia']).toBe(20);
    expect(await executor.getAll("SELECT * FROM franchises WHERE name = 'Vieja';")).toHaveLength(0);
    const version = await executor.getAll<{ user_version: number }>('PRAGMA user_version;');
    expect(version[0].user_version).toBe(SCHEMA_VERSION);
  });

  it('no vuelve a sembrar si la base ya está en la versión actual', async () => {
    const executor = createMemoryExecutor();
    await prepareDatabase(executor);
    await prepareDatabase(executor);

    const rows = await executor.getAll<{ total: number }>(
      'SELECT COUNT(*) AS total FROM franchises;',
    );
    expect(rows[0].total).toBe(28);
  });
});
