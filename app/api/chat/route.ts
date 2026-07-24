import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { generateText } from 'ai';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();

    // Test simple sans streaming pour voir si la clé API fonctionne
    const result = await generateText({
      model: groq(model || 'openai/gpt-oss-120b'),
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: 'Dis juste le mot "bonjour".' }],
    });

    // On renvoie le texte brut pour voir si ça passe
    return new Response(result.text, {
      headers: { 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error("[chat] ERREUR:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
