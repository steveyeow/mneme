import chalk from 'chalk';

export async function serveCommand(): Promise<void> {
  console.log(chalk.cyan('Starting MCP server...'));
  console.log(chalk.dim('Use this in Claude Desktop config:'));
  console.log();
  console.log(JSON.stringify({
    mcpServers: {
      mneme: {
        command: 'npx',
        args: ['mneme-mcp'],
        env: {
          MNEME_DB_PATH: '~/.mneme/mneme.db',
        },
      },
    },
  }, null, 2));
  console.log();
  console.log(chalk.dim('Or run the MCP server directly: npx mneme-mcp'));
}
