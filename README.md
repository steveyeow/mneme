# Mneme

> Your memory. Portable. Permanent. Yours.

Mneme is an open-source, local-first personal memory layer for the AI age. It collects your conversation history across AI platforms, distills it into structured knowledge about you, and makes that knowledge available to any AI — on your terms.

## Name

Mneme (/ˈniːmi/) — from the Greek μνήμη, meaning memory. In Greek mythology, Mneme was one of the original three Muses and the goddess of memory. She is the keeper of what has been experienced, the source from which all knowledge and creativity flows.
Noosphere names the collective sphere of human thought. Mneme names the individual memory that feeds it. Together they form a complete picture: the personal and the collective, the inward and the outward, the one and the many.

## Vision

The AI revolution is producing a new kind of inequality — not of access to tools, but of accumulated context. People who have been using AI for years have built up thousands of conversations worth of implicit context inside platforms they don't control. When they switch platforms, or when better models arrive, that context doesn't come with them.

Mneme is a bet that data sovereignty matters — that the relationship between a person and their AI tools should not be mediated by which platform happens to hold their history.

In the long run, we believe the right model is:
- Your context belongs to you, stored locally, portable by default
- Platforms are service providers, not data custodians
- You decide which AI gets to know what about you
- The more you use AI, the richer your context becomes — not locked inside one platform, but carried with you everywhere

This is what Mneme is building toward. The MVP is a CLI tool. The vision is a new layer in the AI stack — the personal memory layer — that sits below platforms and above models, owned entirely by the person it represents.

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

For the full product vision, architecture, and roadmap, see [mneme-spec.md](./mneme-spec.md).

## License

MIT
