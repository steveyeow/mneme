import { copyFileSync, mkdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import { MnemeDB, getDefaultDbPath, getExportsDir } from '@mneme/core';
import { importChatGPT, importClaude, readExportFile } from '@mneme/importers';

export async function importCommand(platform: string, file: string): Promise<void> {
  const supported = ['chatgpt', 'claude'];
  if (!supported.includes(platform)) {
    console.error(chalk.red(`Unsupported platform: ${platform}`));
    console.error(`Supported: ${supported.join(', ')}`);
    process.exit(1);
  }

  const filePath = resolve(file);
  const spinner = ora(`Reading ${basename(filePath)}...`).start();

  let rawData: any;
  try {
    const readResult = await readExportFile(filePath, platform);
    rawData = readResult.data;
    if (readResult.sourceFile !== basename(filePath)) {
      spinner.text = `Extracted ${readResult.sourceFile} from ZIP archive...`;
    }
  } catch (err: any) {
    spinner.fail(`Failed to read or parse file: ${filePath}`);
    if (err?.message) console.error(chalk.dim(err.message));
    process.exit(1);
  }

  const db = new MnemeDB(getDefaultDbPath());

  try {
    spinner.text = `Importing ${platform} conversations...`;

    let result;
    if (platform === 'chatgpt') {
      const data = Array.isArray(rawData) ? rawData : [rawData];
      result = importChatGPT(db, data);
    } else {
      const data = Array.isArray(rawData) ? rawData : [rawData];
      result = importClaude(db, data);
    }

    const exportsDir = getExportsDir();
    mkdirSync(exportsDir, { recursive: true });
    try {
      copyFileSync(filePath, resolve(exportsDir, basename(filePath)));
    } catch {
      // non-critical if backup copy fails
    }

    spinner.succeed(chalk.green('Import complete'));
    console.log();
    console.log(`  Platform:     ${chalk.cyan(result.platform)}`);
    console.log(`  Total:        ${result.total_conversations}`);
    console.log(`  New:          ${chalk.green(String(result.new_conversations))}`);
    console.log(`  Duplicates:   ${chalk.dim(String(result.skipped_duplicates))}`);
    console.log();

    if (result.new_conversations > 0) {
      console.log(chalk.dim('Run `mneme distill` to extract memories from new conversations.'));
    }
  } finally {
    db.close();
  }
}
