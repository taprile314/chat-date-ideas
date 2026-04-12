import type { TelegramMessage } from '../types/idea';
import { handleHelp } from './handlers/help';
import { callAgent } from './agent-client';

export async function routeMessage(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const text = message.text || '';
  const addedBy = message.from?.first_name || 'Anónimo';
  const isGroup =
    message.chat.type === 'group' || message.chat.type === 'supergroup';

  // Extract command
  const commandMatch = text.match(/^\/(\w+)(?:@\w+)?\s*([\s\S]*)/);
  const command = commandMatch?.[1]?.toLowerCase();

  if (command) {
    switch (command) {
      case 'help':
      case 'ayuda':
      case 'start':
        return handleHelp(chatId);
      default:
        // All other commands route through the agent
        return callAgent(chatId, text, addedBy);
    }
  }

  // No command — free text
  if (isGroup) {
    return;
  }

  // In DM, treat free text as a query via agent
  if (text.trim()) {
    return callAgent(chatId, text, addedBy);
  }
}
