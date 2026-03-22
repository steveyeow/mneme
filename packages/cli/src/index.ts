#!/usr/bin/env node

import { Command } from 'commander';
import { importCommand } from './commands/import.js';
import { distillCommand } from './commands/distill.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';
import { addCommand } from './commands/add.js';
import { archiveCommand } from './commands/archive.js';
import { renderCommand } from './commands/render.js';
import { serveCommand } from './commands/serve.js';
import { statusCommand } from './commands/status.js';

const program = new Command();

program
  .name('mneme')
  .description('Your memory. Portable. Permanent. Yours.')
  .version('0.1.0');

program
  .command('import <platform> <file>')
  .description('Import conversations from a platform export (chatgpt, claude)')
  .action(importCommand);

program
  .command('distill')
  .description('Extract memories from imported conversations using Claude API')
  .option('--limit <n>', 'Max conversations to process', parseInt)
  .action(distillCommand);

program
  .command('list')
  .description('List memories')
  .option('--category <cat>', 'Filter by category')
  .option('--limit <n>', 'Max results', parseInt)
  .option('--archived', 'Include archived memories')
  .action(listCommand);

program
  .command('search <query>')
  .description('Search memories by content')
  .action(searchCommand);

program
  .command('add <content>')
  .description('Manually add a memory')
  .option('--category <cat>', 'Memory category', 'fact')
  .action(addCommand);

program
  .command('archive <id>')
  .description('Archive a memory')
  .action(archiveCommand);

program
  .command('render')
  .description('Generate system prompt from your memories')
  .option('--copy', 'Copy to clipboard')
  .option('--min-confidence <n>', 'Minimum confidence threshold', parseFloat)
  .action(renderCommand);

program
  .command('serve')
  .description('Start MCP server for Claude Desktop')
  .action(serveCommand);

program
  .command('status')
  .description('Show database stats')
  .action(statusCommand);

program.parse();
