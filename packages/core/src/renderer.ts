import type { Category, Memory, RenderOptions } from './types.js';
import type { MnemeDB } from './db.js';

const CATEGORY_LABELS: Record<Category, string> = {
  background: 'Background',
  project: 'Current Projects',
  preference: 'Preferences',
  goal: 'Goals',
  habit: 'Habits & Patterns',
  fact: 'Other Facts',
};

const CATEGORY_ORDER: Category[] = ['background', 'project', 'preference', 'goal', 'habit', 'fact'];

export function renderSystemPrompt(db: MnemeDB, opts: RenderOptions = {}): string {
  const memories = db.getMemoriesForRender(opts);

  if (memories.length === 0) {
    return '<user_context>\nNo memories recorded yet.\n</user_context>';
  }

  const grouped = new Map<Category, Memory[]>();
  for (const mem of memories) {
    const existing = grouped.get(mem.category) || [];
    existing.push(mem);
    grouped.set(mem.category, existing);
  }

  const lines: string[] = ['<user_context>'];

  for (const category of CATEGORY_ORDER) {
    const mems = grouped.get(category);
    if (!mems?.length) continue;

    lines.push(`[${CATEGORY_LABELS[category]}]`);
    for (const mem of mems) {
      lines.push(`- ${mem.content}`);
    }
    lines.push('');
  }

  lines.push('</user_context>');

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
