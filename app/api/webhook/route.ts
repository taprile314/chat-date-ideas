import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { config as appConfig } from '@/src/config';
import { routeMessage } from '@/src/bot/router';
import type { TelegramUpdate } from '@/src/types/idea';

export const maxDuration = 55;

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-telegram-bot-api-secret-token');
  const expected = appConfig.telegramSecretToken;
  if (expected && secret !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Respond 200 immediately; waitUntil keeps the function alive
  // until agent processing completes (respects Telegram's 5-second ack window)
  if (update.message) {
    waitUntil(
      routeMessage(update.message).catch((err) =>
        console.error('Webhook processing error:', err),
      ),
    );
  }

  return NextResponse.json({ ok: true });
}
