import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Category, Conversation, ConversationMessage, Memory, Platform, RenderOptions, Visibility } from './types.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  messages TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  imported_at TEXT NOT NULL,
  content_hash TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  confidence REAL NOT NULL DEFAULT 0.5,
  source_platform TEXT NOT NULL,
  source_conv_id TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'private',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
CREATE INDEX IF NOT EXISTS idx_memories_archived ON memories(archived);
CREATE INDEX IF NOT EXISTS idx_conversations_platform ON conversations(platform);
CREATE INDEX IF NOT EXISTS idx_conversations_hash ON conversations(content_hash);
`;

export class MnemeDB {
  private db: Database.Database;

  constructor(dbPath: string) {
    mkdirSync(dirname(dbPath), { recursive: true });
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(SCHEMA);
  }

  close(): void {
    this.db.close();
  }

  // --- Conversations ---

  hasConversation(contentHash: string): boolean {
    const row = this.db.prepare('SELECT 1 FROM conversations WHERE content_hash = ?').get(contentHash);
    return row !== undefined;
  }

  insertConversation(conv: Conversation): void {
    this.db.prepare(`
      INSERT INTO conversations (id, platform, external_id, title, messages, created_at, imported_at, content_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      conv.id,
      conv.platform,
      conv.external_id,
      conv.title,
      JSON.stringify(conv.messages),
      conv.created_at,
      conv.imported_at,
      conv.content_hash,
    );
  }

  getConversation(id: string): Conversation | undefined {
    const row = this.db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return { ...row, messages: JSON.parse(row.messages) };
  }

  getUnprocessedConversations(): Conversation[] {
    const rows = this.db.prepare(`
      SELECT c.* FROM conversations c
      LEFT JOIN memories m ON m.source_conv_id = c.id
      WHERE m.id IS NULL
    `).all() as any[];
    return rows.map(row => ({ ...row, messages: JSON.parse(row.messages) }));
  }

  getConversationCount(platform?: Platform): number {
    if (platform) {
      const row = this.db.prepare('SELECT COUNT(*) as count FROM conversations WHERE platform = ?').get(platform) as any;
      return row.count;
    }
    const row = this.db.prepare('SELECT COUNT(*) as count FROM conversations').get() as any;
    return row.count;
  }

  // --- Memories ---

  insertMemory(memory: Memory): void {
    this.db.prepare(`
      INSERT INTO memories (id, content, category, tags, confidence, source_platform, source_conv_id, visibility, created_at, updated_at, archived)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      memory.id,
      memory.content,
      memory.category,
      JSON.stringify(memory.tags),
      memory.confidence,
      memory.source_platform,
      memory.source_conv_id,
      memory.visibility,
      memory.created_at,
      memory.updated_at,
      memory.archived ? 1 : 0,
    );
  }

  getMemory(id: string): Memory | undefined {
    const row = this.db.prepare('SELECT * FROM memories WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return this.rowToMemory(row);
  }

  listMemories(opts: {
    category?: Category;
    visibility?: Visibility;
    archived?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Memory[] {
    const conditions: string[] = [];
    const params: any[] = [];

    if (opts.category) {
      conditions.push('category = ?');
      params.push(opts.category);
    }
    if (opts.visibility) {
      conditions.push('visibility = ?');
      params.push(opts.visibility);
    }
    if (opts.archived !== undefined) {
      conditions.push('archived = ?');
      params.push(opts.archived ? 1 : 0);
    }

    let sql = 'SELECT * FROM memories';
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY updated_at DESC';
    if (opts.limit) {
      sql += ' LIMIT ?';
      params.push(opts.limit);
    }
    if (opts.offset) {
      sql += ' OFFSET ?';
      params.push(opts.offset);
    }

    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map(row => this.rowToMemory(row));
  }

  searchMemories(query: string): Memory[] {
    const rows = this.db.prepare(
      "SELECT * FROM memories WHERE content LIKE ? AND archived = 0 ORDER BY confidence DESC"
    ).all(`%${query}%`) as any[];
    return rows.map(row => this.rowToMemory(row));
  }

  updateMemory(id: string, updates: Partial<Pick<Memory, 'content' | 'category' | 'tags' | 'confidence' | 'visibility' | 'archived'>>): boolean {
    const fields: string[] = [];
    const params: any[] = [];

    if (updates.content !== undefined) { fields.push('content = ?'); params.push(updates.content); }
    if (updates.category !== undefined) { fields.push('category = ?'); params.push(updates.category); }
    if (updates.tags !== undefined) { fields.push('tags = ?'); params.push(JSON.stringify(updates.tags)); }
    if (updates.confidence !== undefined) { fields.push('confidence = ?'); params.push(updates.confidence); }
    if (updates.visibility !== undefined) { fields.push('visibility = ?'); params.push(updates.visibility); }
    if (updates.archived !== undefined) { fields.push('archived = ?'); params.push(updates.archived ? 1 : 0); }

    if (fields.length === 0) return false;

    fields.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const result = this.db.prepare(`UPDATE memories SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return result.changes > 0;
  }

  archiveMemory(id: string): boolean {
    return this.updateMemory(id, { archived: true });
  }

  getMemoryCount(archived?: boolean): number {
    if (archived !== undefined) {
      const row = this.db.prepare('SELECT COUNT(*) as count FROM memories WHERE archived = ?').get(archived ? 1 : 0) as any;
      return row.count;
    }
    const row = this.db.prepare('SELECT COUNT(*) as count FROM memories').get() as any;
    return row.count;
  }

  getMemoriesForRender(opts: RenderOptions = {}): Memory[] {
    const conditions: string[] = [];
    const params: any[] = [];

    if (!opts.include_archived) {
      conditions.push('archived = 0');
    }

    if (opts.categories?.length) {
      conditions.push(`category IN (${opts.categories.map(() => '?').join(',')})`);
      params.push(...opts.categories);
    }

    if (opts.visibility?.length) {
      conditions.push(`visibility IN (${opts.visibility.map(() => '?').join(',')})`);
      params.push(...opts.visibility);
    }

    if (opts.min_confidence !== undefined) {
      conditions.push('confidence >= ?');
      params.push(opts.min_confidence);
    }

    let sql = 'SELECT * FROM memories';
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY confidence DESC, updated_at DESC';

    if (opts.max_memories) {
      sql += ' LIMIT ?';
      params.push(opts.max_memories);
    }

    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map(row => this.rowToMemory(row));
  }

  addMemoryManual(content: string, category: Category): Memory {
    const now = new Date().toISOString();
    const memory: Memory = {
      id: randomUUID(),
      content,
      category,
      tags: [],
      confidence: 1.0,
      source_platform: 'manual',
      source_conv_id: '',
      visibility: 'private',
      created_at: now,
      updated_at: now,
      archived: false,
    };
    this.insertMemory(memory);
    return memory;
  }

  private rowToMemory(row: any): Memory {
    return {
      ...row,
      tags: JSON.parse(row.tags),
      archived: row.archived === 1,
    };
  }
}
