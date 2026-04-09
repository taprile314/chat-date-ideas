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
  await handleQuery(chatId, 'Dame una idea aleatoria con todos los detalles.');
}
