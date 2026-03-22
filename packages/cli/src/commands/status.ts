import chalk from 'chalk';
import { MnemeDB, getDefaultDbPath } from '@mneme/core';

export async function statusCommand(): Promise<void> {
  const dbPath = getDefaultDbPath();
  const db = new MnemeDB(dbPath);

  try {
    const totalConvs = db.getConversationCount();
    const chatgptConvs = db.getConversationCount('chatgpt');
    const claudeConvs = db.getConversationCount('claude');
    const activeMemories = db.getMemoryCount(false);
    const archivedMemories = db.getMemoryCount(true);
    const unprocessed = db.getUnprocessedConversations().length;

    console.log(chalk.cyan.bold('\n  Mneme Status\n'));
    console.log(`  Database:      ${chalk.dim(dbPath)}`);
    console.log();
    console.log(`  Conversations: ${totalConvs}`);
    if (chatgptConvs) console.log(`    ChatGPT:     ${chatgptConvs}`);
    if (claudeConvs) console.log(`    Claude:      ${claudeConvs}`);
    console.log();
    console.log(`  Memories:      ${activeMemories} active, ${archivedMemories} archived`);
    console.log(`  Unprocessed:   ${unprocessed} conversations`);
    console.log();

    if (unprocessed > 0) {
      console.log(chalk.dim('  Run `mneme distill` to process new conversations.'));
      console.log();
    }
  } finally {
    db.close();
  }
}
