import { v4 as uuid } from 'uuid';
import { getAllIdeas, appendIdea } from '@/src/services/sheets';
import { parseAddMessage } from '@/src/services/ai';
import type { DateIdea } from '@/src/types/idea';

function formatIdea(idea: DateIdea): string {
  const emoji: Record<string, string> = {
    restaurant: '🍽️',
    outdoors: '🌳',
    movie: '🎬',
    activity: '🎯',
    travel: '✈️',
    other: '💡',
  };
  const icon = emoji[idea.category] || '💡';
  const cost =
    idea.cost_exact !== null
      ? `${idea.cost_tier}, ~$${idea.cost_exact}`
      : idea.cost_tier;
  return `${icon} **${idea.title}** (${cost})\n${idea.description}${idea.tags.length ? `\nTags: ${idea.tags.join(', ')}` : ''}`;
}

export async function searchIdeas({ query }: { query: string }): Promise<string> {
  'use step';

  const ideas = await getAllIdeas();
  if (ideas.length === 0) return 'No hay ideas guardadas todavía.';

  const q = query.toLowerCase();
  const filtered = ideas.filter(
    (i) =>
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.cost_tier.toLowerCase().includes(q) ||
      i.tags.some((t) => t.toLowerCase().includes(q)),
  );

  if (filtered.length === 0)
    return `No encontré ideas que coincidan con "${query}". Prueba con otros términos o agrega más ideas.`;

  return filtered.map(formatIdea).join('\n\n');
}

export async function addIdea({
  content,
  addedBy,
}: {
  content: string;
  addedBy: string;
}): Promise<string> {
  'use step';

  const parsed = await parseAddMessage(content);
  const idea: DateIdea = {
    id: uuid(),
    created_at: new Date().toISOString(),
    added_by: addedBy,
    title: parsed.title,
    description: parsed.description,
    cost_tier: parsed.cost_tier,
    cost_exact: parsed.cost_exact,
    category: parsed.category,
    tags: parsed.tags,
    raw_input: content,
  };
  await appendIdea(idea);
  return `Idea guardada: "${idea.title}" (${idea.category}, ${idea.cost_tier})`;
}

export async function listAllIdeas(): Promise<string> {
  'use step';

  const ideas = await getAllIdeas(100);
  if (ideas.length === 0) return 'No hay ideas guardadas todavía.';

  return ideas.map(formatIdea).join('\n\n');
}

export async function getRandomIdea(): Promise<string> {
  'use step';

  const ideas = await getAllIdeas();
  if (ideas.length === 0) return 'No hay ideas guardadas todavía.';

  const pick = ideas[Math.floor(Math.random() * ideas.length)];
  return `🎲 Idea al azar:\n\n${formatIdea(pick)}`;
}
