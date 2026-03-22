import { randomUUID } from 'node:crypto';
import chalk from 'chalk';
import ora from 'ora';
import { MnemeDB, MemoryExtractor, getDefaultDbPath } from '@mneme/core';
import type { Memory, Platform } from '@mneme/core';

export async function distillCommand(opts: { limit?: number }): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error(chalk.red('ANTHROPIC_API_KEY environment variable is required.'));
    console.error(chalk.dim('Set it with: export ANTHROPIC_API_KEY=your-key'));
    process.exit(1);
  }

  const db = new MnemeDB(getDefaultDbPath());

  try {
    let conversations = db.getUnprocessedConversations();

    if (conversations.length === 0) {
      console.log(chalk.dim('No new conversations to process.'));
      return;
    }

    if (opts.limit) {
      conversations = conversations.slice(0, opts.limit);
    }

    console.log(chalk.cyan(`Processing ${conversations.length} conversation(s)...\n`));

    const extractor = new MemoryExtractor(apiKey);
    let totalMemories = 0;

    for (let i = 0; i < conversations.length; i++) {
      const conv = conversations[i];
      const label = conv.title || conv.id.slice(0, 8);
      const spinner = ora(`[${i + 1}/${conversations.length}] ${label}`).start();

      const result = await extractor.extractFromConversation(conv);

      const now = new Date().toISOString();
      for (const extracted of result.memories) {
        const memory: Memory = {
          id: randomUUID(),
          content: extracted.content,
          category: extracted.category,
          tags: extracted.tags,
          confidence: extracted.confidence,
          source_platform: conv.platform as Platform,
          source_conv_id: conv.id,
          visibility: 'private',
          created_at: now,
          updated_at: now,
          archived: false,
        };
        db.insertMemory(memory);
      }

      totalMemories += result.memories.length;
      spinner.succeed(`[${i + 1}/${conversations.length}] ${label} → ${result.memories.length} memories`);
    }

    console.log();
    console.log(chalk.green(`Done. Extracted ${totalMemories} memories from ${conversations.length} conversations.`));
    console.log(chalk.dim('Run `mneme list` to review, or `mneme render` to generate your system prompt.'));
  } finally {
    db.close();
  }
}
