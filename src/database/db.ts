import * as SQLite from 'expo-sqlite';
import { createNativeExecutor } from './executor';
import { prepareDatabase } from './prepare';
import { setExecutor } from './index';

export const DB_NAME = 'tufranquiciabo.db';

export async function initDatabase() {
  const nativeDb = await SQLite.openDatabaseAsync(DB_NAME);
  const executor = createNativeExecutor(nativeDb);
  try {
    await prepareDatabase(executor);
  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
    await executor.exec('DROP TABLE IF EXISTS milestones; DROP TABLE IF EXISTS messages; DROP TABLE IF EXISTS favorites; DROP TABLE IF EXISTS onboarding_completed; DROP TABLE IF EXISTS franchises; DROP TABLE IF EXISTS users;');
    await prepareDatabase(executor);
  }
  setExecutor(executor);
  return executor;
}
