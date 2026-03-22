import chalk from 'chalk';
import { MnemeDB, getDefaultDbPath } from '@mneme/core';

export async function searchCommand(query: string): Promise<void> {
  const db = new MnemeDB(getDefaultDbPath());

  try {
    const memories = db.searchMemories(query);

    if (memories.length === 0) {
      console.log(chalk.dim(`No memories matching "${query}".`));
      return;
    }

    for (const mem of memories) {
      const conf = chalk.dim(`(${(mem.confidence * 100).toFixed(0)}%)`);
      const id = chalk.dim(mem.id.slice(0, 8));
      const cat = chalk.cyan(`[${mem.category}]`);
      console.log(`${id} ${cat} ${mem.content} ${conf}`);
    }

    console.log(chalk.dim(`\n${memories.length} results.`));
  } finally {
    db.close();
  }
}
