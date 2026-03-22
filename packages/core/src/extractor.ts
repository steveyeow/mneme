import Anthropic from '@anthropic-ai/sdk';
import type { Conversation, ExtractedMemory, ExtractionResult } from './types.js';

const EXTRACTION_PROMPT = `You are a personal memory extraction engine. Your job is to read a conversation between a user and an AI assistant, and extract atomic facts about the USER — not about the conversation topic, not about the AI's responses, only about the user themselves.

Each extracted fact should be:
- About the user personally (their background, preferences, projects, goals, habits, facts about them)
- Atomic — one fact per item, not compound sentences
- Durable — likely to remain true over time (prefer "User is a software engineer" over "User asked about Python today")
- Useful as context for future AI conversations

Categories:
- project: Something the user is building or working on
- preference: A preference about tools, communication style, workflows, etc.
- background: Professional or personal background information
- goal: Something the user wants to achieve
- habit: A recurring behavior or pattern
- fact: Any other factual information about the user

Confidence scoring:
- 1.0: Explicitly stated by the user ("I am a software engineer")
- 0.8: Strongly implied ("I've been writing TypeScript for years" → user is experienced with TypeScript)
- 0.6: Reasonably inferred from context
- 0.4: Weak inference, might be wrong

Respond with a JSON array of extracted memories. If no user facts can be extracted, return an empty array.

Format:
[
  {
    "content": "User is building an open-source AI memory tool called Mneme",
    "category": "project",
    "tags": ["mneme", "open-source", "ai"],
    "confidence": 1.0
  }
]

IMPORTANT: Only return the JSON array, no other text.`;

export class MemoryExtractor {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model || process.env.MNEME_MODEL || 'claude-sonnet-4-20250514';
  }

  async extractFromConversation(conversation: Conversation): Promise<ExtractionResult> {
    const userMessages = conversation.messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n---\n\n');

    if (!userMessages.trim()) {
      return { conversation_id: conversation.id, memories: [] };
    }

    const truncated = userMessages.slice(0, 50000);

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `${EXTRACTION_PROMPT}\n\n--- CONVERSATION (user messages only) ---\n\n${truncated}`,
          },
        ],
      });

      const text = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('');

      const memories = this.parseExtraction(text);
      return { conversation_id: conversation.id, memories };
    } catch (error) {
      console.error(`Extraction failed for conversation ${conversation.id}:`, error);
      return { conversation_id: conversation.id, memories: [] };
    }
  }

  private parseExtraction(text: string): ExtractedMemory[] {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((item: any) =>
          typeof item.content === 'string' &&
          typeof item.category === 'string' &&
          ['project', 'preference', 'background', 'goal', 'habit', 'fact'].includes(item.category)
        )
        .map((item: any) => ({
          content: item.content,
          category: item.category,
          tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
          confidence: typeof item.confidence === 'number' ? Math.min(1, Math.max(0, item.confidence)) : 0.5,
        }));
    } catch {
      return [];
    }
  }
}
