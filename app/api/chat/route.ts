import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { streamText } from 'ai';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();
    console.log('[chat] model =', model, '| key =', process.env.GROQ_API_KEY ? 'OK' : 'MANQUANTE');

    const result = await streamText({
      model: groq(model || 'openai/gpt-oss-120b'),
      system: SYSTEM_PROMPT,
      messages,
      // tools,             // ← désactivé pour tester
      // maxSteps: 5,       // ← désactivé
      maxTokens: 8000,
      temperature: 0.7,
      // providerOptions: { groq: { reasoningFormat: 'parsed' } },  // ← désactivé
    });

    return result.toDataStreamResponse();  // ← sans sendReasoning
  } catch (error) {
    console.error('[chat] ERREUR:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
