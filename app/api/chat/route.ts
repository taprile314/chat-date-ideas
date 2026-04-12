import type { UIMessage } from 'ai';
import { createUIMessageStreamResponse } from 'ai';
import { start } from 'workflow/api';
import { chat } from '@/workflows/chat';

export const maxDuration = 55;

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Se requiere el campo "messages"' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const run = await start(chat, [messages]);

  return createUIMessageStreamResponse({
    stream: run.readable,
    headers: {
      'x-workflow-run-id': run.runId,
    },
  });
}
