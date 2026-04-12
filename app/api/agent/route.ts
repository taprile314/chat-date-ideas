import type { UIMessage } from 'ai';
import { start } from 'workflow/api';
import { chat } from '@/workflows/chat';

export const maxDuration = 55;

export async function POST(request: Request) {
  const { text, addedBy } = (await request.json()) as {
    text: string;
    addedBy: string;
  };

  const messages: UIMessage[] = [
    {
      id: 'telegram-msg',
      role: 'user',
      parts: [{ type: 'text', text: `[De: ${addedBy}] ${text}` }],
    },
  ];

  const run = await start(chat, [messages]);
  const resultMessages = await run.returnValue;

  // Extract the last assistant text from the returned model messages
  let responseText = 'No pude generar una respuesta. Intenta de nuevo.';
  if (Array.isArray(resultMessages)) {
    for (let i = resultMessages.length - 1; i >= 0; i--) {
      const msg = resultMessages[i] as { role: string; content: unknown };
      if (msg.role !== 'assistant') continue;

      // content can be a plain string or an array of parts
      if (typeof msg.content === 'string' && msg.content.trim()) {
        responseText = msg.content;
        break;
      }
      if (Array.isArray(msg.content)) {
        const textParts = msg.content
          .filter((p: { type: string }) => p.type === 'text')
          .map((p: { type: string; text: string }) => p.text);
        if (textParts.length > 0) {
          responseText = textParts.join('');
          break;
        }
      }
    }
  }

  return Response.json({ text: responseText });
}
