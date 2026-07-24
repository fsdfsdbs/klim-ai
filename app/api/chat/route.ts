import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { generateText } from 'ai';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();
    console.log('[chat] model =', model, '| key =', process.env.GROQ_API_KEY ? 'OK' : 'MANQUANTE');

    // On utilise generateText au lieu de streamText pour voir l'erreur brute
    const result = await generateText({
      model: groq(model || 'openai/gpt-oss-120b'),
      system: SYSTEM_PROMPT,
      messages,
    });

    console.log('[chat] Succès ! Texte reçu.');
    return new Response(JSON.stringify({ text: result.text }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[chat] ERREUR BRUTE:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
