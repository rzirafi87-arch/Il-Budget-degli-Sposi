"use client";
import { useEffect, useState } from "react";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/chat", { method: "GET" });
        const data = await res.json();
        if (!active) return;
        setEnabled(Boolean(data?.enabled));
      } catch {
        if (!active) return;
        setEnabled(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !enabled) return;
    setError("");
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setLoading(true);
    setInput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Errore durante la richiesta.");
      }
      setMessages([...newMessages, { role: "assistant", content: data?.reply || "" }]);
    } catch {
      setError("Connessione non disponibile.");
    } finally {
      setLoading(false);
    }
  }

  if (enabled === null) {
    return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#A3B59D] to-[#e6f2e0] p-4">
        <div className="text-gray-700">Verifica disponibilità assistente…</div>
      </div>
    );
  }

  if (!enabled) {
    return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#A3B59D] to-[#e6f2e0] p-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-6 border border-gray-200 text-center">
          <h1 className="text-2xl font-bold mb-3">Assistente AI non disponibile</h1>
          <p className="text-gray-600">Configura la variabile <code>OPENAI_API_KEY</code> per abilitare la chat.</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-[#A3B59D] to-[#e6f2e0] p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-center">Chat con il tuo assistente AI</h1>
        <div className="mb-2 text-sm text-red-600 h-5">{error || ""}</div>
        <div className="mb-4 h-64 overflow-y-auto border rounded p-2 bg-gray-50">
          {messages.length === 0 && <div className="text-gray-400 text-center mt-16">Inizia la conversazione...</div>}
          {messages.map((msg, i) => (
            <div key={i} className={`mb-2 text-sm ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <span className={msg.role === "user" ? "bg-[#A3B59D] text-white px-3 py-2 rounded-xl inline-block" : "bg-gray-200 text-gray-800 px-3 py-2 rounded-xl inline-block"}>
                {msg.content}
              </span>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-base"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Scrivi un messaggio..."
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-[#A3B59D] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[#8da182] transition-all disabled:opacity-60"
            disabled={loading || !input.trim()}
          >{loading ? "Invio..." : "Invia"}</button>
        </form>
      </div>
    </div>
  );
}
