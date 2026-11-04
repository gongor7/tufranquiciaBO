import { prepareDatabase } from '../database/prepare';
import { SCHEMA_VERSION } from '../database/schema';
import { createMemoryExecutor } from '../test-utils';

describe('T26: esquema v3 (registro de usuario y tickets)', () => {
  it('reconstruye desde una base v2 y sube la versión del esquema', async () => {
    const executor = createMemoryExecutor();
    // Esquema v2 simplificado (sin users con registro, con messages)
    await executor.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'inversionista',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      );
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
      CREATE TABLE messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        franchise_id INTEGER NOT NULL,
        message TEXT NOT NULL
      );
      PRAGMA user_version = 2;
    `);

    await prepareDatabase(executor);

    const version = await executor.getAll<{ user_version: number }>('PRAGMA user_version;');
    expect(version[0].user_version).toBe(SCHEMA_VERSION);
    expect(SCHEMA_VERSION).toBe(3);
  });

  it('crea la tabla tickets y elimina messages', async () => {
    const executor = createMemoryExecutor();
    await prepareDatabase(executor);

    const tickets = await executor.getAll<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='tickets';",
    );
    expect(tickets).toHaveLength(1);

    const messages = await executor.getAll<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='messages';",
    );
    expect(messages).toHaveLength(0);
  });

  it('agrega campos de registro a users con valores por defecto (no registrado)', async () => {
    const executor = createMemoryExecutor();
    await prepareDatabase(executor);

    const user = await executor.getAll<{
      registered: number;
      accepted_terms: number;
      full_name: string | null;
      username: string | null;
      role: string;
    }>('SELECT registered, accepted_terms, full_name, username, role FROM users LIMIT 1;');

    expect(user).toHaveLength(1);
    expect(user[0].registered).toBe(0);
    expect(user[0].accepted_terms).toBe(0);
    expect(user[0].role).toBe('inversionista');
  });

  it('mantiene el seed de 28 oportunidades tras la reconstrucción', async () => {
    const executor = createMemoryExecutor();
    await prepareDatabase(executor);

    const rows = await executor.getAll<{ total: number }>(
      'SELECT COUNT(*) AS total FROM franchises;',
    );
    expect(rows[0].total).toBe(28);
  });

  it('persiste un ticket con estado inicial nuevo', async () => {
    const executor = createMemoryExecutor();
    await prepareDatabase(executor);

    await executor.run(
      `INSERT INTO tickets (franchise_id, full_name, email, phone, status)
       VALUES (1, 'Prueba Usuario', 'p@p.bo', '+591 70000000', 'nuevo');`,
    );
    const tickets = await executor.getAll<{ status: string; full_name: string }>(
      'SELECT status, full_name FROM tickets;',
    );
    expect(tickets).toHaveLength(1);
    expect(tickets[0].status).toBe('nuevo');
    expect(tickets[0].full_name).toBe('Prueba Usuario');
  });
});
