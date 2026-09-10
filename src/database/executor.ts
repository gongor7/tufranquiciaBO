import * as SQLite from 'expo-sqlite';

export interface SqlExecutor {
  getAll<T>(sql: string, params?: (string | number | null)[]): Promise<T[]>;
  run(sql: string, params?: (string | number | null)[]): Promise<{ changes: number; lastInsertId?: number }>;
  exec(sql: string): Promise<void>;
}

export function createNativeExecutor(db: SQLite.SQLiteDatabase): SqlExecutor {
  return {
    async getAll<T>(sql: string, params: (string | number | null)[] = []): Promise<T[]> {
      return db.getAllAsync(sql, params) as Promise<T[]>;
    },
    async run(sql: string, params: (string | number | null)[] = []) {
      const result = await db.runAsync(sql, params);
      return { changes: result.changes, lastInsertId: Number(result.lastInsertRowId) };
    },
    async exec(sql: string) {
      await db.execAsync(sql);
    },
  };
}