# Mneme

> Your memory. Portable. Permanent. Yours.

Mneme is an open-source, local-first personal memory layer for the AI age. It collects your conversation history across AI platforms, distills it into structured knowledge about you, and makes that knowledge available to any AI — on your terms.

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Import your ChatGPT conversations
node packages/cli/dist/index.js import chatgpt ~/Downloads/conversations.json

# Import your Claude conversations
node packages/cli/dist/index.js import claude ~/Downloads/claude_export.json

# Extract memories (requires ANTHROPIC_API_KEY)
export ANTHROPIC_API_KEY=sk-ant-...
node packages/cli/dist/index.js distill

# Review your memories
node packages/cli/dist/index.js list

# Generate system prompt
node packages/cli/dist/index.js render

# Copy to clipboard
node packages/cli/dist/index.js render --copy
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `mneme import <platform> <file>` | Import conversations from ChatGPT or Claude export |
| `mneme distill` | Extract memories from new conversations via Claude API |
| `mneme list [--category <cat>]` | List memories |
| `mneme search <query>` | Search memories by content |
| `mneme add <content> --category <cat>` | Manually add a memory |
| `mneme archive <id>` | Archive a memory |
| `mneme render [--copy]` | Generate and output system prompt |
| `mneme serve` | Show MCP server setup instructions |
| `mneme status` | Show database statistics |

## MCP Server (Claude Desktop)

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "mneme": {
      "command": "npx",
      "args": ["mneme-mcp"],
      "env": {
        "MNEME_DB_PATH": "~/.mneme/mneme.db"
      }
    }
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Required for memory extraction | — |
| `MNEME_DB_PATH` | SQLite database path | `~/.mneme/mneme.db` |
| `MNEME_MODEL` | Claude model for extraction | `claude-sonnet-4-20250514` |

## Architecture

```
packages/
├── core/           # Memory types, DB, extraction, rendering
├── importers/      # ChatGPT and Claude export parsers
├── cli/            # Commander.js CLI
└── mcp-server/     # MCP server for Claude Desktop
```

All data is stored locally in a single SQLite file at `~/.mneme/mneme.db`.

## License

MIT
