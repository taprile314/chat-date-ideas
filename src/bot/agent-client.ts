import { sendReply } from './reply';

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function callAgent(
  chatId: number,
  text: string,
  addedBy: string,
): Promise<void> {
  try {
    const url = `${getAppUrl()}/api/agent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, addedBy }),
    });

    if (!res.ok) {
      console.error(`Agent API error: ${res.status} ${res.statusText}`);
      await sendReply(chatId, 'Error al procesar tu mensaje. Intenta de nuevo.');
      return;
    }

    const { text: responseText } = (await res.json()) as { text: string };
    await sendReply(chatId, responseText);
  } catch (err) {
    console.error('callAgent error:', err);
    await sendReply(chatId, 'Error al procesar tu mensaje. Intenta de nuevo.');
  }
}
