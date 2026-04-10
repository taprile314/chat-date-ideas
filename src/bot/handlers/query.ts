import { sendReply } from '../reply';
import { answerQuery } from '../../services/ai';
import { getAllIdeas } from '../../services/sheets';

export async function handleQuery(
  chatId: number,
  question: string
): Promise<void> {
  const ideas = await getAllIdeas();

  if (ideas.length === 0) {
    await sendReply(
      chatId,
      'Aún no tienen ideas guardadas. Usa /add para agregar la primera. 😊'
    );
    return;
  }

  const response = await answerQuery(ideas, question);
  await sendReply(chatId, response);
}

export async function handleList(chatId: number): Promise<void> {
  await handleQuery(chatId, 'Muéstrame todas las ideas, agrupadas por categoría.');
}

export async function handleRandom(chatId: number): Promise<void> {
  const ideas = await getAllIdeas();

  if (ideas.length === 0) {
    await sendReply(
      chatId,
      'Aún no tienen ideas guardadas. Usa /add para agregar la primera. 😊'
    );
    return;
  }

  const idea = ideas[Math.floor(Math.random() * ideas.length)];

  const categoryEmoji: Record<string, string> = {
    restaurant: '🍽️',
    outdoors: '🌳',
    movie: '🎬',
    activity: '🎯',
    travel: '✈️',
    other: '💡',
  };
  const emoji = categoryEmoji[idea.category] || '💡';
  const cost = idea.cost_exact !== null ? `, ~$${idea.cost_exact}` : '';

  await sendReply(
    chatId,
    `🎲 *${idea.title}*\n${emoji} ${idea.category} (${idea.cost_tier}${cost})\n${idea.description}`
  );
}
