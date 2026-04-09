import { randomUUID } from 'crypto';
import { sendReply } from '../reply';
import { parseAddMessage } from '../../services/ai';
import { appendIdea } from '../../services/sheets';
import type { DateIdea } from '../../types/idea';

export async function handleAdd(
  chatId: number,
  text: string,
  addedBy: string
): Promise<void> {
  if (!text.trim()) {
    await sendReply(
      chatId,
      'Usa /add seguido de tu idea.\nEjemplo: _/add ir al cine este viernes_'
    );
    return;
  }

  const parsed = await parseAddMessage(text);

  const idea: DateIdea = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    added_by: addedBy,
    title: parsed.title,
    description: parsed.description,
    cost_tier: parsed.cost_tier,
    cost_exact: parsed.cost_exact,
    category: parsed.category,
    tags: parsed.tags,
    raw_input: text,
  };

  await appendIdea(idea);

  const categoryEmoji: Record<string, string> = {
    restaurant: '🍽️',
    outdoors: '🌳',
    movie: '🎬',
    activity: '🎯',
    travel: '✈️',
    other: '💡',
  };

  const emoji = categoryEmoji[idea.category] || '💡';
  await sendReply(
    chatId,
    `✅ *Guardado:* ${emoji} ${idea.title} (${idea.category}, ${idea.cost_tier})`
  );
}
