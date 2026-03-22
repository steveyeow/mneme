import chalk from 'chalk';
import { MnemeDB, getDefaultDbPath } from '@mneme/core';
import type { Category } from '@mneme/core';

const CATEGORY_COLORS: Record<string, (s: string) => string> = {
  project: chalk.cyan,
  preference: chalk.magenta,
  background: chalk.blue,
  goal: chalk.green,
  habit: chalk.yellow,
  fact: chalk.white,
};

export async function listCommand(opts: {
  category?: string;
  limit?: number;
  archived?: boolean;
}): Promise<void> {
  const db = new MnemeDB(getDefaultDbPath());

  try {
    const memories = db.listMemories({
      category: opts.category as Category | undefined,
      archived: opts.archived ? undefined : false,
      limit: opts.limit || 50,
    });

    if (memories.length === 0) {
      console.log(chalk.dim('No memories found.'));
      return;
    }

    for (const mem of memories) {
      const colorFn = CATEGORY_COLORS[mem.category] || chalk.white;
      const tag = colorFn(`[${mem.category}]`);
      const conf = chalk.dim(`(${(mem.confidence * 100).toFixed(0)}%)`);
      const id = chalk.dim(mem.id.slice(0, 8));
      const archived = mem.archived ? chalk.red(' [archived]') : '';
      console.log(`${id} ${tag} ${mem.content} ${conf}${archived}`);
    }

    console.log(chalk.dim(`\n${memories.length} memories shown.`));
  } finally {
    db.close();
  }
}
