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
      messages,
      maxTokens: 8000,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
    
  } catch (error) {
    // Cette erreur apparaîtra dans les logs Vercel
    console.error('[chat] ERREUR:', error); 
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue côté serveur.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
