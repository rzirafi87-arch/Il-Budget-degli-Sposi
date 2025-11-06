"use client";
import React, { useState } from "react";

type AISuggestionsChatProps = {
  userLang: string;
  userCountry: string;
  userEventType: string;
};

export default function AISuggestionsChat({ userLang, userCountry, userEventType }: AISuggestionsChatProps) {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "Ciao! Sono il tuo assistente AI per il matrimonio. Fai una domanda o chiedi un consiglio!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: input }]);
    // Simulazione chiamata AI: puoi sostituire con una vera API
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Suggerimento personalizzato per "${input}":
- Ricorda di verificare fornitori e budget!
- Consulta la checklist per ${userCountry === "mx" ? "le tradizioni messicane" : "le tradizioni italiane"}.
- Se hai dubbi, chiedi pure!`
      }]);
      setLoading(false);
      setInput("");
    }, 1200);
  }

  return (
    <div className="bg-white border rounded-xl shadow-md p-4 mb-6 max-w-xl mx-auto">
      <h3 className="font-bold mb-2 text-[#A3B59D]">Chat AI - Suggerimenti & Consigli</h3>
      <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span className={msg.role === "user" ? "inline-block bg-[#A3B59D] text-white px-3 py-2 rounded-lg" : "inline-block bg-gray-100 text-gray-800 px-3 py-2 rounded-lg"}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Scrivi una domanda..."
          disabled={loading}
        />
        <button type="submit" className="bg-[#A3B59D] text-white px-4 py-2 rounded-lg" disabled={loading}>
          Invia
        </button>
      </form>
    </div>
  );
}
