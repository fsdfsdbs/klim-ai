import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { tools } from '@/lib/tools';
import { streamText } from 'ai';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, model } = await req.json();

  const result = await streamText({
    model: groq(model || 'llama-3.3-70b-versatile'),
    system: SYSTEM_PROMPT,
    messages,
    tools,
    maxSteps: 5,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}
