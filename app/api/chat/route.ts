import { NextRequest, NextResponse } from 'next/server';
import { getAllIdeas } from '@/src/services/sheets';
import { answerQuery } from '@/src/services/ai';

export const maxDuration = 55;

export async function POST(request: NextRequest) {
  const { question } = await request.json();

  if (!question || typeof question !== 'string') {
    return NextResponse.json(
      { error: 'Se requiere el campo "question"' },
      { status: 400 }
    );
  }

  const ideas = await getAllIdeas();
  const answer = await answerQuery(ideas, question);

  return NextResponse.json({ answer });
}
