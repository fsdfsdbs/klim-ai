import { getModel, SYSTEM_PROMPT } from '@/lib/groq';
import { tools } from '@/lib/tools';
import { streamText, convertToCoreMessages } from 'ai';

export const runtime = 'edge';
export const maxDuration = 60;

const MAX_HISTORY = 14;

interface Skill {
  name: string;
  description: string;
  content: string;
}

function buildSystemPrompt(messages: any[], skills: Skill[] = []): string {
  try {
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === 'user')?.content?.toLowerCase() || '';

    const matchedSkills = (skills || []).filter((s) => {
      if (!s?.description) return false;
      const keywords = s.description
        .toLowerCase()
        .split(/[\s,;]+/)
        .filter((w) => w.length > 3);
      return keywords.some((k) => lastUserMessage.includes(k));
    });

    if (matchedSkills.length === 0) return SYSTEM_PROMPT;

    const skillsBlock = matchedSkills
      .map((s) => `### Skill actif : ${s.name}\n${s.content}`)
      .join('\n\n');

    return `${SYSTEM_PROMPT}\n\nSKILLS PERSONNALISÉS DÉCLENCHÉS POUR CETTE REQUÊTE :\n${skillsBlock}`;
  } catch {
    return SYSTEM_PROMPT;
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 3000): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const msg = String(error?.message || error || '');
      const isRateLimit = msg.includes('rate_limit') || msg.includes('Rate limit') || msg.includes('429');
      if (isRateLimit && attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Échec après plusieurs tentatives');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawMessages = body?.messages || [];
    const model = body?.model || 'openai/gpt-oss-120b';
    const skills = body?.skills || [];

    const trimmedMessages =
      rawMessages.length > MAX_HISTORY ? rawMessages.slice(-MAX_HISTORY) : rawMessages;

    const coreMessages = convertToCoreMessages(trimmedMessages);

const result = await withRetry(async () =>
streamText({
        model: getModel(model),
        system: buildSystemPrompt(rawMessages, skills),
        messages: coreMessages,
        tools,
        maxSteps: 5,
        maxTokens: model?.includes('deepseek') ? 12000 : 5500,
        temperature: 0.7,
      })

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('[chat] ERREUR:', error?.message || error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Erreur de streaming' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
