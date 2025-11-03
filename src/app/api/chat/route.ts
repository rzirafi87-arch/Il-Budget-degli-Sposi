/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

// GET /api/chat -> returns availability status without exposing secrets
export async function GET() {
  const enabled = Boolean(process.env.OPENAI_API_KEY);
  return NextResponse.json({ enabled });
}

// POST /api/chat -> proxies a chat completion to OpenAI
export async function POST(req: NextRequest) {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Servizio non disponibile: API Key OpenAI mancante.", reply: "" },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const requestedModel = typeof body?.model === "string" && body.model.trim().length > 0
      ? body.model.trim()
      : (process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini");
    const fallbackModels = (process.env.OPENAI_FALLBACK_MODELS || "gpt-4o-mini")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    const uniqueModels = Array.from(new Set([requestedModel, ...fallbackModels]));
    const temperature = typeof body?.temperature === "number" ? body.temperature : 0.7;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Richiesta non valida: 'messages' mancante o vuoto.", reply: "" },
        { status: 400 }
      );
    }

    // Try primary model, then fallbacks on quota/rate-limit/model errors
    const tried: Array<{ model: string; status?: number; error?: string }> = [];
    for (const model of uniqueModels) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model, messages, temperature }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const reply = data?.choices?.[0]?.message?.content || "(Nessuna risposta)";
        return NextResponse.json({ reply, model, tried });
      }

      const message = data?.error?.message || "Errore dal provider AI.";
      tried.push({ model, status: res.status, error: message });

      // Fallback on typical quota/rate limit/model-not-found errors
      const shouldFallback = [402, 403, 404, 409, 422, 429, 500, 503].includes(res.status)
        || /quota|rate limit|model|insufficient/i.test(message || "");
      if (!shouldFallback) {
        return NextResponse.json(
          { error: message, reply: "", tried },
          { status: res.status }
        );
      }
      // else continue to next model
    }

    // All models failed
    const last = tried[tried.length - 1];
    return NextResponse.json(
      { error: last?.error || "Tutti i modelli hanno fallito.", reply: "", tried },
      { status: last?.status || 503 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Errore interno inatteso.", reply: "" },
      { status: 500 }
    );
  }
}
