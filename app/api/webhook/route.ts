import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/src/config';
import { routeMessage } from '@/src/bot/router';
import type { TelegramUpdate } from '@/src/types/idea';

export const maxDuration = 55;

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-telegram-bot-api-secret-token');
  const expected = config.telegramSecretToken;
  if (expected && secret !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const update: TelegramUpdate = await request.json();
    if (update.message) {
      await routeMessage(update.message);
    }
  } catch (err) {
    console.error('Webhook error:', err);
  }

  return NextResponse.json({ ok: true });
}
