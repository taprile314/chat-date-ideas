import { UIMessage } from 'ai';
import { getAllIdeas } from '@/src/services/sheets';
import { streamQueryResponse } from '@/src/services/ai';

export const maxDuration = 55;

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Se requiere el campo "messages"' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const ideas = await getAllIdeas();
  const result = await streamQueryResponse(ideas, messages);

  return result.toUIMessageStreamResponse();
}
