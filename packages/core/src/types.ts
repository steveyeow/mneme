export type Category = 'project' | 'preference' | 'background' | 'goal' | 'habit' | 'fact';

export type Visibility = 'private' | 'selective' | 'public';

export type Platform = 'chatgpt' | 'claude' | 'gemini' | 'perplexity' | 'manual' | 'unknown';

export interface Memory {
  id: string;
  content: string;
  category: Category;
  tags: string[];
  confidence: number;
  source_platform: Platform;
  source_conv_id: string;
  visibility: Visibility;
  created_at: string;
  updated_at: string;
  archived: boolean;
}

export interface Conversation {
  id: string;
  platform: Platform;
  external_id: string;
  title: string;
  messages: ConversationMessage[];
  created_at: string;
  imported_at: string;
  content_hash: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ExtractedMemory {
  content: string;
  category: Category;
  tags: string[];
  confidence: number;
}

export interface ImportResult {
  platform: Platform;
  total_conversations: number;
  new_conversations: number;
  skipped_duplicates: number;
}

export interface ExtractionResult {
  conversation_id: string;
  memories: ExtractedMemory[];
}

export interface RenderOptions {
  categories?: Category[];
  visibility?: Visibility[];
  min_confidence?: number;
  max_memories?: number;
  include_archived?: boolean;
}
