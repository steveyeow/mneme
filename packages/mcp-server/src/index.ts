#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { MnemeDB, renderSystemPrompt, getDefaultDbPath } from '@mneme/core';
import type { Category } from '@mneme/core';

const db = new MnemeDB(getDefaultDbPath());

const server = new McpServer({
  name: 'mneme',
  version: '0.1.0',
});

server.tool(
  'get_user_memories',
  'Get the user\'s personal context and memories as a structured system prompt',
  {
    category: z.enum(['project', 'preference', 'background', 'goal', 'habit', 'fact']).optional().describe('Filter by memory category'),
    min_confidence: z.number().min(0).max(1).optional().describe('Minimum confidence threshold (0-1)'),
  },
  async ({ category, min_confidence }) => {
    const prompt = renderSystemPrompt(db, {
      categories: category ? [category] : undefined,
      min_confidence,
    });

    return {
      content: [{ type: 'text' as const, text: prompt }],
    };
  },
);

server.tool(
  'search_memories',
  'Search the user\'s memories by keyword',
  {
    query: z.string().describe('Search query'),
  },
  async ({ query }) => {
    const memories = db.searchMemories(query);

    if (memories.length === 0) {
      return {
        content: [{ type: 'text' as const, text: `No memories found for "${query}".` }],
      };
    }

    const text = memories
      .map(m => `[${m.category}] ${m.content} (confidence: ${(m.confidence * 100).toFixed(0)}%)`)
      .join('\n');

    return {
      content: [{ type: 'text' as const, text }],
    };
  },
);

server.tool(
  'list_memories',
  'List all active memories, optionally filtered by category',
  {
    category: z.enum(['project', 'preference', 'background', 'goal', 'habit', 'fact']).optional().describe('Filter by category'),
    limit: z.number().optional().describe('Maximum number of results'),
  },
  async ({ category, limit }) => {
    const memories = db.listMemories({
      category: category as Category | undefined,
      archived: false,
      limit: limit || 100,
    });

    if (memories.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'No memories found.' }],
      };
    }

    const text = memories
      .map(m => `[${m.category}] ${m.content}`)
      .join('\n');

    return {
      content: [{ type: 'text' as const, text }],
    };
  },
);

server.tool(
  'add_memory',
  'Add a new memory about the user',
  {
    content: z.string().describe('The memory content'),
    category: z.enum(['project', 'preference', 'background', 'goal', 'habit', 'fact']).describe('Memory category'),
  },
  async ({ content, category }) => {
    const memory = db.addMemoryManual(content, category);
    return {
      content: [{ type: 'text' as const, text: `Memory added: [${memory.category}] ${memory.content}` }],
    };
  },
);

server.tool(
  'get_memory_stats',
  'Get statistics about the user\'s memory library',
  {},
  async () => {
    const active = db.getMemoryCount(false);
    const archived = db.getMemoryCount(true);
    const conversations = db.getConversationCount();

    return {
      content: [{
        type: 'text' as const,
        text: `Memory stats:\n- Active memories: ${active}\n- Archived memories: ${archived}\n- Imported conversations: ${conversations}`,
      }],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
