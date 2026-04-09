import type { IncomingMessage, ServerResponse } from 'http';
import { config } from '../src/config';
import { routeMessage } from '../src/bot/router';
import type { TelegramUpdate } from '../src/types/idea';

function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  // Only accept POST
  if (req.method !== 'POST') {
    res.writeHead(200);
    res.end('OK');
    return;
  }

  const secret = req.headers['x-telegram-bot-api-secret-token'];
  const expected = config.telegramSecretToken;
  if (expected && secret !== expected) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const body = await parseBody(req);
    const update: TelegramUpdate = JSON.parse(body);

    if (update.message) {
      await routeMessage(update.message);
    }
  } catch (err) {
    console.error('Webhook error:', err);
  }

  // Always return 200 to Telegram
  res.writeHead(200);
  res.end('OK');
}
