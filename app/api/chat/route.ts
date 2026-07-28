import { getModel, SYSTEM_PROMPT } from "@/lib/groq";
import { tools } from "@/lib/tools";
import { streamText, convertToCoreMessages, type CoreMessage, type Message } from "ai";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Skill {
  name: string;
  description: string;
  content: string;
}

interface ChatRequestBody {
  messages: Message[];
  model?: string;
  skills?: Skill[];
}

const MAX_HISTORY = 10;

function buildSystemPrompt(allMessages: Message[], skills: Skill[]): string {
  try {
    const lastUserContent =
      [...allMessages]
        .reverse()
        .find((m): m is Message & { role: "user" } => m.role === "user")
        ?.content?.toLowerCase() ?? "";

    const matchedSkills = skills.filter((s) => {
      const triggerText = s.description || "";
      if (!triggerText) return false;
      const keywords = triggerText
        .toLowerCase()
        .split(/[\s,;]+/)
        .filter((w: string) => w.length > 2);
      return keywords.some((k: string) => lastUserContent.includes(k));
    });

    if (matchedSkills.length === 0) return SYSTEM_PROMPT;

    const skillsBlock = matchedSkills
      .map((s) => `### Skill actif : ${s.name}\n${s.content}`)
      .join("\n\n");

    return `${SYSTEM_PROMPT}\n\nSKILLS PERSONNALISÉS DÉCLENCHÉS :\n${skillsBlock}`;
  } catch {
    return SYSTEM_PROMPT;
  }
}

function trimMessages(messages: Message[]): Message[] {
  let trimmed = messages.slice(-MAX_HISTORY);
  while (trimmed.length > 1 && trimmed[0].role !== "user") {
    trimmed = trimmed.slice(1);
  }
  return trimmed;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body: ChatRequestBody = await req.json();
    const rawMessages = body.messages || [];

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return new Response(JSON.stringify({ error: "messages requis" }), { status: 400 });
    }

    const model = body.model ?? "openai/gpt-oss-120b";
    const skills = body.skills ?? [];

    const trimmedMessages = trimMessages(rawMessages);
    const coreMessages: CoreMessage[] = convertToCoreMessages(trimmedMessages);
    const systemPrompt = buildSystemPrompt(rawMessages, skills);

    const result = streamText({
      model: getModel(model),
      system: systemPrompt,
      messages: coreMessages,
      tools,
      maxSteps: 2, // Limite les boucles d'outils pour économiser les tokens
      maxTokens: 3500, // Ajusté pour ne pas exploser le quota TPM de Groq
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("[chat] ERREUR:", error?.message || error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erreur du serveur" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
