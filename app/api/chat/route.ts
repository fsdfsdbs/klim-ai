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
  conversationId?: string;
}

function generateId(prefix: string): string {
  const rand = crypto.randomUUID().slice(0, 8);
  return `${prefix}_${rand}`;
}

const MAX_HISTORY = 14;

function buildSystemPrompt(
  allMessages: Message[],
  skills: Skill[],
): string {
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

    return `${SYSTEM_PROMPT}\n\nSKILLS PERSONNALISÉS DÉCLENCHÉS POUR CETTE REQUÊTE :\n${skillsBlock}`;
  } catch {
    return SYSTEM_PROMPT;
  }
}

function trimMessages(messages: Message[]): Message[] {
  const cleaned = messages.filter((m) => {
    if (m.role !== 'assistant') return true;
    const hasContent = !!m.content?.trim();
    const hasToolInvocations = !!(m as any).toolInvocations?.length;
    return hasContent || hasToolInvocations;
  });

  let trimmed =
    cleaned.length > MAX_HISTORY ? cleaned.slice(-MAX_HISTORY) : cleaned;

  while (trimmed.length > 1 && trimmed[0].role !== "user") {
    trimmed = trimmed.slice(1);
  }

  return trimmed.map((m, i) => {
    const isLast = i === trimmed.length - 1;
    if (isLast || !(m as any).toolInvocations?.length) return m;

    return {
      ...m,
      toolInvocations: (m as any).toolInvocations.map((t: any) => ({
        ...t,
        result:
          t.state === 'result'
            ? { note: '(résultat d\'un outil précédent, tronqué pour économiser des tokens)' }
            : t.result,
      })),
    };
  });
}

function isRetryableError(error: unknown): boolean {
  const anyErr = error as any;
  const status = anyErr?.status ?? anyErr?.statusCode ?? anyErr?.response?.status;
  if ([429, 500, 502, 503, 504].includes(status)) return true;

  const msg = String(anyErr?.message ?? anyErr ?? "");
  return /rate_limit|rate limit|429|too many requests|5\d{2}/i.test(msg);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 4,
  baseDelayMs = 4000,
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (isRetryableError(error) && attempt < retries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(`[retry] tentative ${attempt + 1}/${retries}, attente ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Échec après plusieurs tentatives");
}

export async function POST(req: Request): Promise<Response> {
  const requestId = generateId("req");
  const startTime = Date.now();

  try {
    let body: ChatRequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body", code: "PARSE_ERROR" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const rawMessages = body.messages;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages required", code: "VALIDATION_ERROR" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const model = body.model ?? "openai/gpt-oss-120b";
    const skills = body.skills ?? [];

    const trimmedMessages = trimMessages(rawMessages);
    const coreMessages: CoreMessage[] = convertToCoreMessages(trimmedMessages);
    const systemPrompt = buildSystemPrompt(rawMessages, skills);

    // Augmentation de la capacité de réponse max pour les gros fichiers HTML (8192 tokens)
    const result = await withRetry(async () =>
      streamText({
        model: getModel(model),
        system: systemPrompt,
        messages: coreMessages,
        tools,
        maxSteps: 3,
        maxTokens: model.toLowerCase().includes("deepseek") ? 12000 : 8192,
        temperature: 0.7,
        onError: (err) => {
          console.error(`[streamText error] ${requestId}:`, err);
        },
      }),
    );

    const duration = Date.now() - startTime;
    console.log(`[chat] ${requestId} — ${model} — ${duration}ms — ${rawMessages.length} messages`);

    return result.toDataStreamResponse();
  } catch (error: any) {
    const message = error?.message ?? "Erreur de streaming";
    const status = error?.status ?? 500;

    console.error(`[chat] ERREUR ${requestId}:`, error?.message || error);

    return new Response(
      JSON.stringify({
        error: message,
        code: "INTERNAL_ERROR",
        requestId,
      }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
