import { homedir } from 'node:os';
import { join } from 'node:path';

export function getDefaultDbPath(): string {
  return process.env.MNEME_DB_PATH || join(homedir(), '.mneme', 'mneme.db');
}

export function getExportsDir(): string {
  return join(homedir(), '.mneme', 'exports');
}
