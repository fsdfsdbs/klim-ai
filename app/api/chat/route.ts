import { groq, SYSTEM_PROMPT } from '@/lib/groq';
import { tools } from '@/lib/tools';
import { streamText } from 'ai';

export const runtime = 'edge';
export const maxDuration = 60;

interface Skill {
  name: string;
  description: string;
  content: string;
}

function buildSystemPrompt(messages: any[], skills: Skill[] = []): string {
  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === 'user')?.content?.toLowerCase() || '';

  const matchedSkills = skills.filter((s) => {
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
}

export async function POST(req: Request) {
  const { messages, model, skills } = await req.json();

  const result = await streamText({
    model: groq(model || 'openai/gpt-oss-120b'),
    system: buildSystemPrompt(messages, skills),
    messages,
    tools,
    maxSteps: 5,
    maxTokens: 8000,
    temperature: 0.7,
    providerOptions: {
      groq: {
        reasoningFormat: 'parsed',
      },
    },
  });

  return result.toDataStreamResponse({ sendReasoning: true });
}
