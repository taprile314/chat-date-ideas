import type { TelegramMessage } from '../types/idea';
import { handleAdd } from './handlers/add';
import { handleHelp } from './handlers/help';
import { handleQuery, handleList, handleRandom } from './handlers/query';

export async function routeMessage(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const text = message.text || '';
  const addedBy = message.from?.first_name || 'Anónimo';
  const isGroup =
    message.chat.type === 'group' || message.chat.type === 'supergroup';

  // Extract command and payload
  const commandMatch = text.match(/^\/(\w+)(?:@\w+)?\s*([\s\S]*)/);
  const command = commandMatch?.[1]?.toLowerCase();
  const payload = commandMatch?.[2]?.trim() || '';

  if (command) {
    switch (command) {
      case 'add':
        return handleAdd(chatId, payload, addedBy);
      case 'list':
        return handleList(chatId);
      case 'random':
        return handleRandom(chatId);
      case 'query':
      case 'buscar':
        return handleQuery(chatId, payload || 'Muéstrame algunas ideas.');
      case 'help':
      case 'ayuda':
      case 'start':
        return handleHelp(chatId);
      default:
        // Unknown command — ignore in group, help in DM
        if (!isGroup) {
          return handleHelp(chatId);
        }
        return;
    }
  }

  // No command — free text
  if (isGroup) {
    // In groups, ignore free text (no @mention handling for simplicity)
    return;
  }

  // In DM, treat free text as a query
  if (text.trim()) {
    return handleQuery(chatId, text);
  }
}
