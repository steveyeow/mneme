import chalk from 'chalk';
import { MnemeDB, getDefaultDbPath } from '@mneme/core';
import type { Category } from '@mneme/core';

const VALID_CATEGORIES: Category[] = ['project', 'preference', 'background', 'goal', 'habit', 'fact'];

export async function addCommand(content: string, opts: { category?: string }): Promise<void> {
  const category = (opts.category || 'fact') as Category;

  if (!VALID_CATEGORIES.includes(category)) {
    console.error(chalk.red(`Invalid category: ${category}`));
    console.error(`Valid: ${VALID_CATEGORIES.join(', ')}`);
    process.exit(1);
  }

  const db = new MnemeDB(getDefaultDbPath());

  try {
    const memory = db.addMemoryManual(content, category);
    console.log(chalk.green('Memory added.'));
    console.log(`  ID:       ${chalk.dim(memory.id.slice(0, 8))}`);
    console.log(`  Category: ${chalk.cyan(memory.category)}`);
    console.log(`  Content:  ${memory.content}`);
  } finally {
    db.close();
  }
}
