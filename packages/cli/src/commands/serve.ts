import chalk from 'chalk';
import { getDefaultDbPath } from '@mneme/core';

export async function serveCommand(): Promise<void> {
  console.log(chalk.cyan('Starting MCP server...\n'));

  const dbPath = getDefaultDbPath();

  console.log('Add this to your Claude Desktop config');
  console.log(chalk.dim('(~/Library/Application Support/Claude/claude_desktop_config.json):\n'));
  console.log(JSON.stringify({
    mcpServers: {
      mneme: {
        command: 'node',
        args: ['packages/mcp-server/dist/index.js'],
        env: {
          MNEME_DB_PATH: dbPath,
        },
      },
    },
  }, null, 2));
  console.log();

  console.log(chalk.dim('Or if installed globally via npm:'));
  console.log(JSON.stringify({
    mcpServers: {
      mneme: {
        command: 'npx',
        args: ['@mneme/mcp-server'],
        env: {
          MNEME_DB_PATH: dbPath,
        },
      },
    },
  }, null, 2));
  console.log();
}
