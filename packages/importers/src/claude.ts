import { createHash, randomUUID } from 'node:crypto';
import type { Conversation, ConversationMessage, ImportResult, MnemeDB } from '@mneme/core';

interface ClaudeMessage {
  sender: 'human' | 'assistant';
  text: string;
  created_at?: string;
}

interface ClaudeConversation {
  uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
  chat_messages: ClaudeMessage[];
}

function convertMessages(msgs: ClaudeMessage[]): ConversationMessage[] {
  if (!Array.isArray(msgs)) return [];
  return msgs
    .filter(m => {
      if (!m || typeof m !== 'object') return false;
      const sender = m.sender;
      if (sender !== 'human' && sender !== 'assistant') return false;
      return typeof m.text === 'string' && m.text.trim().length > 0;
    })
    .map(m => ({
      role: m.sender === 'human' ? 'user' as const : 'assistant' as const,
      content: m.text,
      timestamp: m.created_at,
    }));
}

function hashContent(messages: ConversationMessage[]): string {
  const content = messages.map(m => `${m.role}:${m.content}`).join('\n');
  return createHash('sha256').update(content).digest('hex');
}

export function importClaude(db: MnemeDB, data: ClaudeConversation[]): ImportResult {
  let newConversations = 0;
  let skippedDuplicates = 0;

  for (const raw of data) {
    try {
      if (!raw || typeof raw !== 'object') {
        skippedDuplicates++;
        continue;
      }

      const messages = convertMessages(raw.chat_messages || []);
      if (messages.length === 0) {
        skippedDuplicates++;
        continue;
      }

      const contentHash = hashContent(messages);

      if (db.hasConversation(contentHash)) {
        skippedDuplicates++;
        continue;
      }

      const conv: Conversation = {
        id: randomUUID(),
        platform: 'claude',
        external_id: raw.uuid || randomUUID(),
        title: raw.name || 'Untitled',
        messages,
        created_at: raw.created_at || new Date().toISOString(),
        imported_at: new Date().toISOString(),
        content_hash: contentHash,
      };

      db.insertConversation(conv);
      newConversations++;
    } catch {
      skippedDuplicates++;
    }
  }

  return {
    platform: 'claude',
    total_conversations: data.length,
    new_conversations: newConversations,
    skipped_duplicates: skippedDuplicates,
  };
}
