# Mneme

> Your memory. Portable. Permanent. Yours.

Mneme is an open-source, local-first personal memory layer for the AI age. It collects your conversation history across every AI platform, distills it into structured knowledge about you, and makes that knowledge available to any AI you choose to use — on your terms.

## Name

**Mneme** (/ˈniːmi/) — from the Greek μνήμη, meaning memory. In Greek mythology, Mneme was one of the original three Muses and the goddess of memory. She is the keeper of what has been experienced, the source from which all knowledge and creativity flows.

Noosphere names the collective sphere of human thought. Mneme names the individual memory that feeds it. Together they form a complete picture: the personal and the collective, the inward and the outward, the one and the many.

---

## Vision

The AI revolution is producing a new kind of inequality — not of access to tools, but of **accumulated context**. People who have been using AI for years have built up thousands of conversations worth of implicit context inside platforms they don't control. When they switch platforms, or when better models arrive, that context doesn't come with them.

Mneme is a bet that data sovereignty matters — that the relationship between a person and their AI tools should not be mediated by which platform happens to hold their history.

In the long run, we believe the right model is:
- Your context belongs to you, stored locally, portable by default
- Platforms are service providers, not data custodians
- You decide which AI gets to know what about you
- The more you use AI, the richer your context becomes — not locked inside one platform, but carried with you everywhere

This is what Mneme is building toward. The MVP is a CLI tool. The vision is a new layer in the AI stack — the personal memory layer — that sits below platforms and above models, owned entirely by the person it represents.

---

## The Problem

### The Context Tax

Every time you start a conversation with a new AI — or even a new conversation on the same platform — you pay a tax. You re-introduce yourself. You re-explain your project. You re-establish your preferences. You re-build the context that makes the conversation actually useful.

This is not a minor inconvenience. For people who use AI as a serious tool, this friction compounds every single day.

### Your Data is Scattered and Locked

Most heavy AI users don't use just one platform. They use Claude for focused writing and code, ChatGPT for brainstorming, Gemini for research, Perplexity for search. Each of these platforms has been learning about you — through thousands of conversations — and that accumulated understanding is trapped inside their walls.

ChatGPT has a version of you. Claude has a different version of you. Gemini has another. None of them talk to each other. None of that knowledge is portable. And if any platform shuts down, raises prices, or changes its policies, you lose everything it learned about you.

### Platforms Have No Incentive to Fix This

ChatGPT Memory and Claude Projects are attempts to solve "the AI remembers you" problem — but only within their own platform. This is not an oversight. Conversation history and accumulated context are a platform's most powerful retention mechanism. They will never voluntarily make it portable.

This is a structural problem, not a product gap waiting to be filled by incumbents.

---

## The Solution

Mneme is a **personal memory operating system** that sits outside any platform.

It collects your conversation history from wherever you've been talking to AI. It distills that raw history into structured, atomic memories — facts about who you are, what you're working on, how you think, what you prefer. It stores those memories locally, in a database you own. And it makes those memories available to any AI you use, through a system prompt that can be injected into any platform.

The result: every AI you talk to starts from a position of understanding, not ignorance. Your context follows you, not the platform.

---

## Core Concepts

### Memory vs. Conversation

Mneme separates two distinct things that other platforms conflate:

**Conversations** are the raw material — the full transcripts of everything you've said to every AI. Mneme stores them locally as an archive, but they are not directly used in real-time AI interactions. They are the source from which memories are extracted.

**Memories** are distilled, atomic facts extracted from conversations. "User is building an open-source AI memory tool in TypeScript." "User prefers direct, concise responses without preamble." "User is based in Taiwan and works across time zones." These are the units that get injected into new conversations.

This distinction matters because:
- Raw conversations are too long to inject into a context window
- Over time, thousands of conversations produce hundreds of durable memories
- Memories can be updated, merged, archived — conversations cannot

### The Distillation Process

When you import conversation history, Mneme runs an extraction process:

1. Each conversation is sent to a language model (Claude) with a carefully designed prompt
2. The model extracts only facts about **you** — not topics discussed, not the AI's responses
3. Each fact is tagged with a category (project, preference, background, goal, habit, fact), a confidence score, and a source reference
4. New memories are deduplicated and merged against your existing memory library
5. Contradictory memories are resolved — if you used to work in Python and now work in TypeScript, the old memory is archived, not duplicated

### The Rendering Layer

At any moment, Mneme can render your memory library into a formatted system prompt — a compact, structured text block that any AI can read and understand. This is what gets injected into your conversations.

The rendered prompt is not a raw dump of all memories. It is an intelligently filtered, prioritized selection — the most relevant, most recent, most durable facts about you, formatted for maximum clarity.

```
<user_context>
[Background]
- Software engineer, 8+ years experience, full-stack
- Based in Taiwan

[Current Projects]
- Building Mneme: open-source AI memory portability tool
- Building Noosphere: agent-native knowledge publishing platform

[Preferences]
- TypeScript over JavaScript
- Direct, concise responses — no preamble
- Respond in Chinese unless technical content requires English

[Goals]
- Launch Mneme MVP within 2 weeks
- Build in public, open source from day one
</user_context>
```

This block is what you paste into any platform's custom instructions. One paste. Every future conversation on that platform starts with full context.

### Accumulative by Design

Mneme is not a one-time import. It is a living record that grows with you.

Every time you do a new export from any platform, Mneme performs an incremental import — parsing only new conversations, extracting new memories, merging them into your existing library. Old memories that are still accurate are reinforced. Memories that have been superseded are archived. New memories are added.

Over time, Mneme becomes a richer, more precise picture of who you are — without ever bloating the system prompt that gets injected into conversations.

---

## How It Works

### Step 1: Import

Export your conversation history from any supported platform and drag the file into Mneme.

Supported platforms at launch:
- ChatGPT (Settings → Data Controls → Export Data → `conversations.json`)
- Claude (Settings → Export Data)

Planned:
- Gemini (Google Takeout)
- Perplexity
- Any platform with a JSON export

Mneme parses the export, deduplicates against previous imports using content hashing, and stores the raw conversations locally.

### Step 2: Distill

Mneme runs the extraction pipeline on all new conversations. This is the only step that requires an internet connection (it calls the Claude API). For a typical import of a few hundred conversations, this takes a few minutes and costs a few cents in API fees.

The result: a structured library of memories, each with category, tags, confidence score, and a traceable link back to the source conversation.

### Step 3: Review

Before memories are committed to your library, Mneme shows you what was extracted. You can accept, edit, or discard individual memories. You have full control over what enters your library.

### Step 4: Deploy

Generate your system prompt. Copy it. Paste it into:

- **ChatGPT** → Settings → Personalization → Custom Instructions
- **Claude** → Profile → Personal Preferences
- **Gemini** → Gems → Your custom Gem
- **Any other platform** → Wherever it accepts a system prompt or custom instructions

This is a one-time setup per platform. After that, every conversation on that platform starts with your context already loaded.

### Step 5: Maintain

Once a month (or whenever you remember), do a new export from each platform and re-run the import. Mneme handles the rest — incremental processing, deduplication, memory updates. The whole process takes a few minutes of active attention and a few minutes of background processing.

---

## Data Architecture

### Everything lives locally

```
~/.mneme/
├── mneme.db          ← Single SQLite file. All your data.
└── exports/          ← Backup of your raw export files
    ├── chatgpt_2025_01.json
    └── claude_2025_03.json
```

There is no server. There is no account. There is no cloud sync (unless you choose to add it). Your data is a single file on your machine. Back it up by copying it. Migrate it by moving it.

### Memory schema

Each memory is an atomic record:

```typescript
interface Memory {
  id: string
  content: string          // "User is building a SaaS in Next.js + Supabase"
  category: Category       // project | preference | background | goal | habit | fact
  tags: string[]           // ["nextjs", "supabase", "saas"]
  confidence: number       // 0.0–1.0
  source_platform: string  // "chatgpt"
  source_conv_id: string   // traceable to original conversation
  visibility: Visibility   // private | selective | public
  created_at: string
  updated_at: string
  archived: boolean
}
```

### Access control

Every memory has a visibility setting:

- **private** — never exported, never shared, only used for your own system prompt
- **selective** — included in some exports but not others (e.g., work memories for work AI, personal memories for personal AI)
- **public** — can be shared to Noosphere (see roadmap)

---

## Access Methods

### System Prompt (primary — works everywhere)

The universal method. Works with every AI platform that accepts custom instructions or a system prompt. No technical setup required. One paste per platform.

This is the method that makes Mneme genuinely cross-platform. It does not require any cooperation from AI platforms.

### MCP Server (advanced — Claude Desktop)

For users of Claude Desktop, Mneme can run as an MCP server. Claude reads your memories directly, without any manual copy-pasting. When your memories update, Claude gets the latest version automatically.

Configuration is a single JSON entry in Claude Desktop's config file.

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

---

## Product Values

### Local first

Your data never leaves your machine unless you explicitly choose to share it. The extraction step calls the Claude API — that is the only network request in the default setup. Your memories, your conversations, your system prompts — all local.

### Open source

The full product is open source under MIT. No feature gates, no "pro" tier that locks critical functionality behind a paywall. If you can run a Node.js process, you can run Mneme.

Open source is not just a licensing choice here. It is the trust mechanism. You are storing the most sensitive kind of data — a model of who you are, how you think, what you're working on. The only way to trust a product with that data is to be able to read the code yourself.

### You control what gets shared

Mneme never decides on your behalf what to share with which AI. You review extracted memories before they're committed. You set visibility on each memory. You choose what to include in each platform's system prompt. The AI gets exactly what you give it — nothing more.

### Accumulative, not ephemeral

Most AI memory features are session-based or shallow. Mneme is designed to grow with you over years. The richer your history, the more accurate your memory library, the more useful the context you can give any AI you use.

---

## Why Open Source

Three reasons this product must be open source to succeed:

**Trust.** You are giving Mneme a model of your mind. Open source code is the only credible guarantee that it is not being misused.

**Community.** Importers for new platforms, integrations with new AI tools, improvements to the extraction pipeline — these will come from the community faster than any single team can build them.

**Longevity.** Closed products shut down. Open source forks survive. If Mneme ever stopped being maintained, the code would still exist and the community could continue it. Your data format and your tool remain yours.

---

## Relationship to Noosphere

Mneme and Noosphere are complementary products in the same philosophical family.

**Noosphere** is infrastructure for publishing knowledge outward — turning your ideas, writing, and expertise into agent-readable corpora that any AI can query.

**Mneme** is infrastructure for accumulating knowledge inward — collecting everything AI platforms have learned about you and making it portable.

```
You ──→ Noosphere ──→ World's agents consume your knowledge
World's AIs ──→ Mneme ──→ You carry your context everywhere
```

The deeper connection: a Mneme memory library is, structurally, a private Noosphere corpus. It is a structured, queryable collection of knowledge — about one person, access-controlled by that person.

In a future version, users will be able to selectively publish portions of their Mneme memory to Noosphere — making certain aspects of their context, expertise, or background available to agents that have been granted access. You might share your professional background with a work AI tool, your research interests with a knowledge discovery agent, or your creative preferences with a writing tool.

The data flows in both directions:
- Mneme produces personal knowledge → optionally published to Noosphere
- Noosphere indexes collective knowledge → optionally consumed by agents working on your behalf

---

## Roadmap

### Phase 1: CLI MVP (launch)

The full core product as a command-line tool.

- Import from ChatGPT and Claude exports
- Memory extraction via Claude API
- Local SQLite storage
- Incremental import with deduplication
- Memory review and editing
- System prompt rendering and export
- MCP server for Claude Desktop
- Open source on GitHub, launch on Hacker News and Twitter

Target user: developers and technical AI power users.

### Phase 2: Web UI

A local web interface that makes Mneme accessible to non-technical users.

- Drag-and-drop import
- Visual memory library browser
- One-click system prompt generation and copy
- Memory editing and archiving
- Import history and stats

Target user: anyone who uses AI tools regularly, regardless of technical background.

### Phase 3: Cross-platform expansion

- Gemini importer (via Google Takeout)
- Perplexity importer
- Generic JSON importer with field mapping
- Browser extension for real-time capture (opt-in, clearly disclosed)
- Encrypted optional cloud sync (user-controlled keys)

### Phase 4: Noosphere integration

- Export memory library as a Noosphere corpus
- Selective visibility controls — share specific memory groups with specific agents
- Cross-device sync via self-hosted Noosphere instance
- API for third-party applications to request memory access with user permission

---

## Technical Spec

### Stack

- **Runtime:** Node.js + TypeScript
- **Storage:** SQLite via `better-sqlite3`
- **LLM calls:** Anthropic SDK (`claude-sonnet-4-20250514`)
- **MCP Server:** `@modelcontextprotocol/sdk`
- **CLI:** Commander.js
- **Package manager:** pnpm
- **Monorepo:** pnpm workspaces

### Repository Structure

```
mneme/
├── packages/
│   ├── core/           # Memory extraction, storage, retrieval
│   ├── importers/      # Platform-specific parsers
│   ├── mcp-server/     # MCP server exposing memory tools
│   └── cli/            # CLI interface
├── data/               # Default local data dir (gitignored)
└── README.md
```

### CLI Interface

```bash
mneme import chatgpt ./conversations.json
mneme import claude ./claude_export.json
mneme list [--category project] [--limit 20]
mneme search "typescript"
mneme add "I prefer TypeScript over JavaScript" --category preference
mneme archive <id>
mneme render                  # Print system prompt to stdout
mneme render --copy           # Copy to clipboard
mneme serve                   # Start MCP server
```

### Environment Variables

```
ANTHROPIC_API_KEY      Required for memory extraction
MNEME_DB_PATH          SQLite path (default: ~/.mneme/mneme.db)
MNEME_MODEL            Claude model (default: claude-sonnet-4-20250514)
```

### MVP Acceptance Criteria

- `mneme import chatgpt` parses a real ChatGPT export and stores conversations
- `mneme import claude` parses a real Claude export and stores conversations
- Memory extraction runs and produces structured memories in SQLite
- Incremental re-import deduplicates correctly
- `mneme render` produces a valid, well-formatted system prompt
- Pasting the output into ChatGPT Custom Instructions works as expected
- MCP server starts and responds to `get_user_memories` tool calls from Claude Desktop
- All data is local with no required network calls except Anthropic API

---

*Mneme is open source. Contributions welcome.*
