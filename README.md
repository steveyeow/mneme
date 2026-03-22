# Mneme

> Your memory. Portable. Permanent. Yours.

Mneme is an open-source, local-first personal memory layer for the AI age. It collects your conversation history across AI platforms, distills it into structured knowledge about you, and makes that knowledge available to any AI — on your terms.

## Quick Start

```bash
git clone https://github.com/steveyeow/Mneme.git
cd Mneme
pnpm install && pnpm build
```

Then create an alias for convenience:

```bash
alias mneme="node $(pwd)/packages/cli/dist/index.js"
```

## Usage

### 1. Import your conversations

**ChatGPT:** Settings → Data Controls → Export Data → download `conversations.json`

```bash
mneme import chatgpt ~/Downloads/conversations.json
```

**Claude:** Settings → Export Data → download the ZIP file (or extracted `conversations.json`)

```bash
# Both ZIP and extracted JSON work — Mneme handles both automatically
mneme import claude ~/Downloads/claude-export.zip
mneme import claude ~/Downloads/conversations.json
```

### 2. Extract memories

Requires an Anthropic API key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
mneme distill
```

This sends your conversation history through Claude to extract atomic facts about you. Duplicate memories are automatically detected and merged.

### 3. Review and manage

```bash
mneme list                          # List all memories
mneme list --category project       # Filter by category
mneme search "typescript"           # Search by content
mneme add "I prefer dark mode" --category preference  # Add manually
mneme archive <id>                  # Archive a memory
mneme status                        # Database stats
```

### 4. Generate your system prompt

```bash
mneme render          # Print to stdout
mneme render --copy   # Copy to clipboard
```

Paste the output into any AI platform's custom instructions. One paste per platform — every future conversation starts with your full context.

## CLI Commands

| Command | Description |
|---------|-------------|
| `mneme import <platform> <file>` | Import conversations (supports `.json` and `.zip`) |
| `mneme distill [--limit N]` | Extract memories via Claude API with deduplication |
| `mneme list [--category <cat>]` | List memories |
| `mneme search <query>` | Search memories by content |
| `mneme add <content> --category <cat>` | Manually add a memory |
| `mneme archive <id>` | Archive a memory (prefix match) |
| `mneme render [--copy]` | Generate system prompt |
| `mneme serve` | Show MCP server setup for Claude Desktop |
| `mneme status` | Database statistics |

## MCP Server (Claude Desktop)

Mneme can run as an MCP server so Claude Desktop reads your memories directly:

```json
{
  "mcpServers": {
    "mneme": {
      "command": "node",
      "args": ["/path/to/Mneme/packages/mcp-server/dist/index.js"],
      "env": {
        "MNEME_DB_PATH": "~/.mneme/mneme.db"
      }
    }
  }
}
```

Run `mneme serve` to see the exact config for your setup.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Required for memory extraction | — |
| `MNEME_DB_PATH` | SQLite database path | `~/.mneme/mneme.db` |
| `MNEME_MODEL` | Claude model for extraction | `claude-sonnet-4-20250514` |

## How It Works

1. **Import** — Parse conversation exports from ChatGPT (JSON) or Claude (ZIP/JSON). Conversations are deduplicated by content hash so re-imports are safe.

2. **Distill** — Each conversation's user messages are sent to Claude with an extraction prompt that pulls out atomic facts about you: background, projects, preferences, goals, habits. New memories are deduplicated against existing ones using similarity matching.

3. **Render** — Active memories are grouped by category and formatted into a `<user_context>` block that any AI can understand when pasted into custom instructions.

## Data

All data lives locally in a single SQLite file:

```
~/.mneme/
├── mneme.db          ← All your data
└── exports/          ← Backup of imported files
```

No server. No account. No cloud. Back up by copying the file.

## Architecture

```
packages/
├── core/           # Memory types, SQLite DB, extraction engine, renderer
├── importers/      # ChatGPT + Claude parsers (ZIP + JSON)
├── cli/            # Commander.js CLI
└── mcp-server/     # MCP server for Claude Desktop
```

## License

[MIT](LICENSE)
