import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import type { DateIdea, ParsedAdd } from '../types/idea';

let _genAI: GoogleGenerativeAI | undefined;
function getGenAI() {
  if (!_genAI) _genAI = new GoogleGenerativeAI(config.geminiApiKey);
  return _genAI;
}

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
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: PARSE_SYSTEM,
  });

  const result = await model.generateContent(text);
  const raw = result.response.text().trim();

  // Strip markdown code fences if present
  const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

  try {
    return JSON.parse(json) as ParsedAdd;
  } catch {
    // Fallback: use raw input as title
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
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: QUERY_SYSTEM,
  });

  const ideasText = ideas
    .map(
      (i) =>
        `- ${i.title} (${i.category}, ${i.cost_tier}${i.cost_exact ? `, ~$${i.cost_exact}` : ''}): ${i.description} [tags: ${i.tags.join(', ')}]`
    )
    .join('\n');

  const prompt = `Estas son las ideas guardadas:\n${ideasText}\n\nPregunta: ${question}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
