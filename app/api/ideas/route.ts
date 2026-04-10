import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getAllIdeas, appendIdea } from '@/src/services/sheets';
import { parseAddMessage } from '@/src/services/ai';

export const maxDuration = 55;

export async function GET() {
  const ideas = await getAllIdeas();
  return NextResponse.json(ideas);
}

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  if (!text || typeof text !== 'string') {
    return NextResponse.json(
      { error: 'Se requiere el campo "text"' },
      { status: 400 }
    );
  }

  const parsed = await parseAddMessage(text);

  const idea = {
    id: uuidv4(),
    created_at: new Date().toISOString(),
    added_by: 'web',
    ...parsed,
    raw_input: text,
  };

  await appendIdea(idea);

  return NextResponse.json(idea, { status: 201 });
}
