import { sendReply } from '../reply';

const HELP_TEXT = `🤖 *Bot de Ideas para Citas*

Comandos disponibles:

/add <idea> — Guardar una nueva idea
  _Ejemplo: /add ir al restaurante La Mar, como $50 por persona_

/query <pregunta> — Buscar ideas
  _Ejemplo: /query algo romántico y barato_

/list — Ver todas las ideas guardadas

/random — Dame una idea al azar

/help — Ver este mensaje

💡 En chat privado, puedes escribir directamente sin /query.`;

export async function handleHelp(chatId: number): Promise<void> {
  await sendReply(chatId, HELP_TEXT);
}
