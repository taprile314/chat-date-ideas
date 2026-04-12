import { generateText, streamText, Output, UIMessage, convertToModelMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { DateIdea } from '../types/idea';
import { ParsedAddSchema, type ParsedAdd } from '../types/idea';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const model = google('gemini-2.5-flash');

const PARSE_SYSTEM = `Eres un asistente que extrae datos estructurados de ideas de citas/salidas.
Devuelve SOLO un JSON válido sin texto adicional, con este esquema:
{
  "title": "string (máx 50 caracteres, español)",
  "description": "string (máx 200 caracteres, español)",
  "cost_tier": "free | $ | $$ | $$$",
  "cost_exact": number | null,
  "category": "restaurant | outdoors | movie | activity | travel | other",
  "tags": ["string"]
}
Si no se menciona costo, usa cost_tier "$" y cost_exact null.
Si no puedes determinar la categoría, usa "other".`;

const QUERY_SYSTEM = `Eres un asistente de pareja que ayuda a encontrar ideas para salir.
Responde en español, de forma corta y amigable.
Cuando hay muchas opciones, muestra máximo 3-4.
Si preguntan por presupuesto, filtra por cost_tier y cost_exact.
Si no hay ideas que coincidan, sugiere que agreguen más con /add.
Formato: usa emojis para categorías, nombre en negrita, costo entre paréntesis.`;

export async function parseAddMessage(text: string): Promise<ParsedAdd> {
  try {
    const { output } = await generateText({
      model,
      system: PARSE_SYSTEM,
      prompt: text,
      output: Output.object({ schema: ParsedAddSchema }),
    });
    if (!output) throw new Error('No output generated');
    return output;
  } catch {
    return {
      title: text.slice(0, 50),
      description: text.slice(0, 200),
      cost_tier: '$',
      cost_exact: null,
      category: 'other',
      tags: [],
    };
  }
}

export async function answerQuery(
  ideas: DateIdea[],
  question: string
): Promise<string> {
  const ideasText = ideas
    .map(
      (i) =>
        `- ${i.title} (${i.category}, ${i.cost_tier}${i.cost_exact ? `, ~$${i.cost_exact}` : ''}): ${i.description} [tags: ${i.tags.join(', ')}]`
    )
    .join('\n');

  const prompt = `Estas son las ideas guardadas:\n${ideasText}\n\nPregunta: ${question}`;

  const { text } = await generateText({
    model,
    system: QUERY_SYSTEM,
    prompt,
  });
  return text;
}

export async function streamQueryResponse(ideas: DateIdea[], messages: UIMessage[]) {
  const ideasText = ideas
    .map(
      (i) =>
        `- ${i.title} (${i.category}, ${i.cost_tier}${i.cost_exact ? `, ~$${i.cost_exact}` : ''}): ${i.description} [tags: ${i.tags.join(', ')}]`
    )
    .join('\n');

  const system = `${QUERY_SYSTEM}\n\nEstas son las ideas guardadas:\n${ideasText}`;

  return streamText({
    model,
    system,
    messages: await convertToModelMessages(messages),
  });
}
