import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { streamText } from 'ai';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();

    const result = await streamText({
      model: groq(model || 'openai/gpt-oss-120b'),
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    // On utilise la méthode de base sans options complexes
    return result.toDataStreamResponse();

  } catch (error) {
    console.error("[chat] ERREUR:", error);
    return new Response(
      JSON.stringify({ error: "Erreur de streaming" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
