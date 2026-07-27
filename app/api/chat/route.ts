// app/api/chat/route.ts — v2.0

import { getModel, SYSTEM_PROMPT } from "@/lib/groq";
import { tools } from "@/lib/tools";
import { streamText, convertToCoreMessages, type CoreMessage, type Message } from "ai";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { logger } from "@/lib/observability/logger";
import { captureException } from "@/lib/observability/sentry";
import { generateId } from "@/lib/utils/id";

export const runtime = "edge";
export const maxDuration = 60;

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Skill {
  name: string;
  description: string;       // courte description pour l'affichage
  trigger: string;           // mots-clés de déclenchement (issus du champ "Déclenchement")
  content: string;           // instructions à injecter
}

interface ChatRequestBody {
  messages: Message[];
  model?: string;
  skills?: Skill[];
  conversationId?: string;
}

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

const ChatRequestSchema = z.object({
  messages: z.array(z.any()).min(1),
  model: z.string().optional().default("openai/gpt-oss-120b"),
  skills: z.array(z.object({
    name: z.string(),
    description: z.string(),
    trigger: z.string(),
    content: z.string(),
  })).optional().default([]),
  conversationId: z.string().uuid().optional(),
});

// ──────────────────────────────────────────────
// Rate limiter (optionnel, Redis)
// ──────────────────────────────────────────────

const ratelimit = (() => {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(40, "1 m"),
    analytics: true,
    prefix: "ratelimit:chat",
  });
})();

// ──────────────────────────────────────────────
// Skills : matching par champ "trigger"
// ──────────────────────────────────────────────

const MAX_HISTORY = 14;

function buildSystemPrompt(
  allMessages: Message[],
  skills: Skill[],
  conversationId?: string,
): string {
  try {
    const lastUserContent =
      [...allMessages]
        .reverse()
        .find((m): m is Message & { role: "user" } => m.role === "user")
        ?.content?.toLowerCase() ?? "";

    const matchedSkills = skills.filter((s) => {
      if (!s.trigger) return false;
      const keywords = s.trigger
        .toLowerCase()
        .split(/[\s,;]+/)
        .filter((w) => w.length > 2);
      return keywords.some((k) => lastUserContent.includes(k));
    });

    if (matchedSkills.length === 0) return SYSTEM_PROMPT;

    const skillsBlock = matchedSkills
      .map((s) => `### Skill actif : ${s.name}\n${s.content}`)
      .join("\n\n");

    return `${SYSTEM_PROMPT}\n\nSKILLS PERSONNALISÉS DÉCLENCHÉS POUR CETTE REQUÊTE :\n${skillsBlock}`;
  } catch (err) {
    logger.warn({ err }, "buildSystemPrompt fallback");
    return SYSTEM_PROMPT;
  }
}

// ──────────────────────────────────────────────
// Trimming intelligent (préserve les paires tool-call)
// ──────────────────────────────────────────────

function trimMessages(messages: Message[]): Message[] {
  let trimmed =
    messages.length > MAX_HISTORY ? messages.slice(-MAX_HISTORY) : messages;

  // Ne pas commencer par un tool result / assistant sans le user message
  // qui a déclenché l'appel.
  while (trimmed.length > 1 && trimmed[0].role !== "user") {
    trimmed = trimmed.slice(1);
  }

  return trimmed;
}

// ──────────────────────────────────────────────
// Retry avec backoff exponentiel
// ──────────────────────────────────────────────

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error && "status" in error) {
    return RETRYABLE_STATUS_CODES.has((error as any).status);
  }
  const msg = String(error ?? "");
  return /rate_limit|rate limit|429|too many requests|5\d{2}/i.test(msg);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelayMs = 1000,
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (isRetryableError(error) && attempt < retries) {
        const delay = baseDelayMs * Math.pow(2, attempt); // 1s, 2s, 4s
        logger.warn({ attempt, delay }, "Retry après erreur temporaire");
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Échec après plusieurs tentatives");
}

// ──────────────────────────────────────────────
// POST — Chat
// ──────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  const requestId = generateId("req_");
  const startTime = Date.now();

  try {
    // ── Auth (optionnel, décommente si tu veux) ──
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return new Response(
    //     JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }),
    //     { status: 401, headers: { "Content-Type": "application/json" } }
    //   );
    // }

    // ── Rate limiting ──
    // if (ratelimit && session?.user?.id) {
    //   const { success, limit, remaining, reset } = await ratelimit.limit(session.user.id);
    //   if (!success) {
    //     return new Response(
    //       JSON.stringify({ error: "Too many requests", code: "RATE_LIMITED", limit, remaining, reset }),
    //       { status: 429, headers: { "Content-Type": "application/json", "X-RateLimit-Remaining": "0" } }
    //     );
    //   }
    // }

    // ── Validation ──
    const body: unknown = await req.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          code: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages: rawMessages, model, skills, conversationId } = parsed.data;

    // ── Trimming ──
    const trimmedMessages = trimMessages(rawMessages);

    // ── Conversion au format core ──
    const coreMessages: CoreMessage[] = convertToCoreMessages(trimmedMessages);

    // ── System prompt avec skills ──
    const systemPrompt = buildSystemPrompt(rawMessages, skills, conversationId);

    // ── Streaming ──
    const result = await withRetry(async () =>
      streamText({
        model: getModel(model),
        system: systemPrompt,
        messages: coreMessages,
        tools,
        maxSteps: 5,
        maxTokens: model.toLowerCase().includes("deepseek") ? 12000 : 5500,
        temperature: 0.7,
        onError: (err) => {
          logger.error({ err, requestId }, "streamText error");
        },
      }),
    );

    const response = result.toDataStreamResponse();

    // Log de fin (asynchrone, ne bloque pas la réponse)
    const duration = Date.now() - startTime;
    logger.info(
      { requestId, model, duration, messageCount: rawMessages.length, conversationId },
      "Chat request completed",
    );

    return response;
  } catch (error: any) {
    const message = error?.message ?? "Erreur de streaming";
    const status = error?.status ?? 500;

    logger.error({ err: error, requestId }, "Chat API error");
    captureException(error, { requestId });

    return new Response(
      JSON.stringify({ error: message, code: "INTERNAL_ERROR", requestId }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
