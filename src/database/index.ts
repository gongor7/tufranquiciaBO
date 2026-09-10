import type { SqlExecutor } from './executor';

let currentExecutor: SqlExecutor | null = null;

export function setExecutor(executor: SqlExecutor): void {
  currentExecutor = executor;
}

export function getExecutor(): SqlExecutor {
  if (!currentExecutor) {
    throw new Error('La base de datos no está inicializada.');
  }
  return currentExecutor;
}