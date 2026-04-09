import { config } from '../config';

const TELEGRAM_API = `https://api.telegram.org/bot${config.telegramToken}`;
const MAX_LENGTH = 4096;

export async function sendReply(
  chatId: number,
  text: string
): Promise<void> {
  const truncated =
    text.length > MAX_LENGTH
      ? text.slice(0, MAX_LENGTH - 3) + '...'
      : text;

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: truncated,
      parse_mode: 'Markdown',
    }),
  });

  if (!res.ok) {
    // Retry without parse_mode — Markdown special chars in AI text may break parsing
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: truncated,
      }),
    });
  }
}
