import { createHash, randomUUID } from 'node:crypto';
import type { Conversation, ConversationMessage, ImportResult, MnemeDB } from '@mneme/core';

interface ChatGPTMessage {
  id: string;
  author: { role: string };
  content: { content_type: string; parts?: any[] };
  create_time?: number;
}

interface ChatGPTConversation {
  id: string;
  title: string;
  create_time: number;
  mapping: Record<string, { message?: ChatGPTMessage }>;
}

function extractMessages(conv: ChatGPTConversation): ConversationMessage[] {
  if (!conv.mapping || typeof conv.mapping !== 'object') return [];

  const messages: { msg: ConversationMessage; time: number }[] = [];

  for (const node of Object.values(conv.mapping)) {
    try {
      const msg = node?.message;
      if (!msg?.content?.parts) continue;
      if (!msg.author || typeof msg.author.role !== 'string') continue;

      const role = msg.author.role;
      if (role !== 'user' && role !== 'assistant') continue;

      const textParts = msg.content.parts
        .filter((p: any) => typeof p === 'string')
        .join('\n');

      if (!textParts.trim()) continue;

      messages.push({
        msg: {
          role: role as 'user' | 'assistant',
          content: textParts,
          timestamp: msg.create_time ? new Date(msg.create_time * 1000).toISOString() : undefined,
        },
        time: msg.create_time || 0,
      });
    } catch {
      continue;
    }
  }

  messages.sort((a, b) => a.time - b.time);
  return messages.map(m => m.msg);
}

function hashContent(messages: ConversationMessage[]): string {
  const content = messages.map(m => `${m.role}:${m.content}`).join('\n');
  return createHash('sha256').update(content).digest('hex');
}

export function importChatGPT(db: MnemeDB, data: ChatGPTConversation[]): ImportResult {
  let newConversations = 0;
  let skippedDuplicates = 0;

  for (const raw of data) {
    try {
      if (!raw || typeof raw !== 'object') {
        skippedDuplicates++;
        continue;
      }

      const messages = extractMessages(raw);
      if (messages.length === 0) {
        skippedDuplicates++;
        continue;
      }

      const contentHash = hashContent(messages);

      if (db.hasConversation(contentHash)) {
        skippedDuplicates++;
        continue;
      }

      const createTime = typeof raw.create_time === 'number'
        ? new Date(raw.create_time * 1000).toISOString()
        : new Date().toISOString();

      const conv: Conversation = {
        id: randomUUID(),
        platform: 'chatgpt',
        external_id: raw.id || randomUUID(),
        title: raw.title || 'Untitled',
        messages,
        created_at: createTime,
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
    platform: 'chatgpt',
    total_conversations: data.length,
    new_conversations: newConversations,
    skipped_duplicates: skippedDuplicates,
  };
}
