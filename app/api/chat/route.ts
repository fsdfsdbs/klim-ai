import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: SYSTEM_PROMPT,
    messages,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}
