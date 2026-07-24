import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { streamText } from 'ai';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  let requestBody;
  try {
    requestBody = await req.json();
    console.log("[chat] Requête reçue. Modèle demandé :", requestBody.model);
    
    if (!process.env.GROQ_API_KEY) {
      console.error("[chat] ERREUR FATALE : GROQ_API_KEY est manquante dans l'environnement Vercel.");
      throw new Error("Configuration serveur incomplète (clé API manquante).");
    }

    const { messages, model } = requestBody;

    const result = await streamText({
      model: groq(model || 'openai/gpt-oss-120b'),
      system: SYSTEM_PROMPT,
      messages,
      maxTokens: 8000,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error("[chat] ERREUR INTERCEPTÉE:", error instanceof Error ? error.message : error);
    
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
