import { config } from '../config';

const MAX_LENGTH = 4096;

function telegramApi() {
  return `https://api.telegram.org/bot${config.telegramToken}`;
}

export async function sendReply(
  chatId: number,
  text: string
): Promise<void> {
  const truncated =
    text.length > MAX_LENGTH
      ? text.slice(0, MAX_LENGTH - 3) + '...'
      : text;

  const res = await fetch(`${telegramApi()}/sendMessage`, {
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
    const retry = await fetch(`${telegramApi()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: truncated,
      }),
    });

    if (!retry.ok) {
      console.error(`sendReply failed for chat ${chatId}: ${retry.status} ${retry.statusText}`);
    }
  }
}
