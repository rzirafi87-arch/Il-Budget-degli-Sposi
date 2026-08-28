import { requireUser } from "@/lib/apiAuth";
import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type OpenAIResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4_000;
const MAX_TOTAL_LENGTH = 20_000;

function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return null;

  const messages: ChatMessage[] = [];
  let totalLength = 0;
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const role = "role" in item ? item.role : undefined;
    const content = "content" in item ? item.content : undefined;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || content.length === 0 || content.length > MAX_MESSAGE_LENGTH) {
      return null;
    }
    totalLength += content.length;
    if (totalLength > MAX_TOTAL_LENGTH) return null;
    messages.push({ role, content });
  }
  return messages;
}

export async function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.OPENAI_API_KEY) });
}

export async function POST(req: NextRequest) {
  try {
    await requireUser(req);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Servizio non disponibile: API Key OpenAI mancante.", reply: "" },
        { status: 503 },
      );
    }

    const body: unknown = await req.json().catch(() => null);
    const messages = parseMessages(
      body && typeof body === "object" && "messages" in body ? body.messages : undefined,
    );
    if (!messages) {
      return NextResponse.json(
        { error: "Richiesta non valida o troppo grande.", reply: "" },
        { status: 400 },
      );
    }

    const configuredModels = [
      process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      ...(process.env.OPENAI_FALLBACK_MODELS || "gpt-4o-mini")
        .split(",")
        .map((model) => model.trim())
        .filter(Boolean),
    ];
    const models = Array.from(new Set(configuredModels));
    const tried: Array<{ model: string; status?: number; error?: string }> = [];

    for (const model of models) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, temperature: 0.7 }),
      });
      const data = (await response.json().catch(() => ({}))) as OpenAIResponse;

      if (response.ok) {
        return NextResponse.json({
          reply: data.choices?.[0]?.message?.content || "(Nessuna risposta)",
          model,
        });
      }

      const message = data.error?.message || "Errore dal provider AI.";
      tried.push({ model, status: response.status, error: message });
      const shouldFallback =
        [402, 403, 404, 409, 422, 429, 500, 503].includes(response.status) ||
        /quota|rate limit|model|insufficient/i.test(message);
      if (!shouldFallback) {
        return NextResponse.json({ error: message, reply: "" }, { status: response.status });
      }
    }

    const last = tried.at(-1);
    return NextResponse.json(
      { error: last?.error || "Tutti i modelli hanno fallito.", reply: "" },
      { status: last?.status || 503 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore interno inatteso.";
    const status = message === "Missing JWT" || message === "Invalid JWT" ? 401 : 500;
    return NextResponse.json(
      { error: status === 401 ? "Autenticazione richiesta." : "Errore interno inatteso.", reply: "" },
      { status },
    );
  }
}
