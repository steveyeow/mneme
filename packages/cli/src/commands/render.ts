import chalk from 'chalk';
import { MnemeDB, renderSystemPrompt, getDefaultDbPath } from '@mneme/core';

export async function renderCommand(opts: { copy?: boolean; minConfidence?: number }): Promise<void> {
  const db = new MnemeDB(getDefaultDbPath());

  try {
    const prompt = renderSystemPrompt(db, {
      min_confidence: opts.minConfidence,
    });

    if (opts.copy) {
      try {
        const { default: clipboardy } = await import('clipboardy');
        await clipboardy.write(prompt);
        console.log(chalk.green('System prompt copied to clipboard.'));
        console.log(chalk.dim(`(${prompt.length} characters)`));
      } catch {
        console.error(chalk.yellow('Could not copy to clipboard. Printing instead:\n'));
        console.log(prompt);
      }
    } else {
      console.log(prompt);
    }
  } finally {
    db.close();
  }
}
