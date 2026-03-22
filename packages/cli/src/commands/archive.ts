import chalk from 'chalk';
import { MnemeDB, getDefaultDbPath } from '@mneme/core';

export async function archiveCommand(id: string): Promise<void> {
  const db = new MnemeDB(getDefaultDbPath());

  try {
    const memories = db.listMemories({ archived: false });
    const match = memories.find(m => m.id.startsWith(id));

    if (!match) {
      console.error(chalk.red(`No active memory found with ID starting with "${id}".`));
      process.exit(1);
    }

    db.archiveMemory(match.id);
    console.log(chalk.green('Memory archived.'));
    console.log(`  ${chalk.dim(match.id.slice(0, 8))} ${match.content}`);
  } finally {
    db.close();
  }
}
