import { DurableAgent } from '@workflow/ai/agent';
import type { CompatibleLanguageModel } from '@workflow/ai/agent';
import { getWritable } from 'workflow';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { convertToModelMessages } from 'ai';
import type { UIMessage, UIMessageChunk } from 'ai';
import { z } from 'zod';
import { searchIdeas, addIdea, listAllIdeas, getRandomIdea } from './tools';

const SYSTEM = `Eres un asistente de pareja que ayuda a encontrar y guardar ideas para salir.
Responde en español, de forma corta y amigable.
Cuando hay muchas opciones, muestra máximo 3-4.
Si preguntan por presupuesto, filtra por cost_tier y cost_exact.
Si no hay ideas que coincidan, sugiere que agreguen más.
Formato: usa emojis para categorías, nombre en negrita, costo entre paréntesis.
Si el usuario quiere agregar una idea, usa la herramienta addIdea.
Si el usuario quiere buscar ideas, usa searchIdeas.
Si pide ver todas las ideas, usa listAllIdeas.
Si quiere una idea al azar, usa getRandomIdea.`;

// Model factory must be a 'use step' function so WDK can serialize it
// across workflow step boundaries (plain async functions are not serializable).
async function createModel(): Promise<CompatibleLanguageModel> {
  'use step';
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  return google('gemini-2.5-flash') as unknown as CompatibleLanguageModel;
}

export async function chat(messages: UIMessage[]) {
  'use workflow';

  const agent = new DurableAgent({
    model: createModel,
    system: SYSTEM,
    tools: {
      searchIdeas: {
        description:
          'Buscar ideas de citas filtradas por palabra clave, categoría, costo o tags',
        inputSchema: z.object({
          query: z.string().describe('Término de búsqueda'),
        }),
        execute: searchIdeas,
      },
      addIdea: {
        description:
          'Agregar una nueva idea de cita. Usa esto cuando el usuario describe un plan o actividad que quiere guardar.',
        inputSchema: z.object({
          content: z.string().describe('Descripción de la idea'),
          addedBy: z
            .string()
            .describe('Nombre de quien agrega la idea')
            .default('Web'),
        }),
        execute: addIdea,
      },
      listAllIdeas: {
        description: 'Listar todas las ideas guardadas',
        inputSchema: z.object({}),
        execute: listAllIdeas,
      },
      getRandomIdea: {
        description: 'Obtener una idea al azar',
        inputSchema: z.object({}),
        execute: getRandomIdea,
      },
    },
  });

  const writable = getWritable<UIMessageChunk>();
  const modelMessages = await convertToModelMessages(messages);

  const result = await agent.stream({
    messages: modelMessages,
    writable,
    maxSteps: 5,
  });

  return result.messages;
}
