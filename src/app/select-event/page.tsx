"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Demo: lista eventi mock
// Each event may include an optional `type` matching EventType (e.g., 'wedding','retirement')
const DEMO_EVENTS = [
  { id: "evt-1", name: "Matrimonio Italia", date: "2025-06-15", country: "it", type: "wedding" },
  { id: "evt-2", name: "Boda Mexico", date: "2025-12-10", country: "mx", type: "wedding" },
  { id: "evt-3", name: "Festa Pensione", date: "2026-03-20", country: "it", type: "retirement" },
];

export default function SelectEventPage() {
  const router = useRouter();
  const [events, setEvents] = useState(DEMO_EVENTS);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    const activeEvent = localStorage.getItem("activeEventId");
    if (activeEvent) setSelected(activeEvent);
  }, []);

  function handleSelect(id: string) {
    setSelected(id);
    const ev = events.find((e) => e.id === id) as { id: string; type?: string } | undefined;
    localStorage.setItem("activeEventId", id);
    if (ev?.type) {
      localStorage.setItem("eventType", ev.type);
    }
    router.push("/dashboard");
  }

  function handleCreate() {
    // Demo: crea nuovo evento (default type wedding)
    const newId = `evt-${events.length + 1}`;
    const newEvent = { id: newId, name: `Evento ${newId}`, date: "2026-01-01", country: "it", type: "wedding" };
    setEvents([...events, newEvent]);
    setSelected(newId);
    localStorage.setItem("activeEventId", newId);
    localStorage.setItem("eventType", "wedding");
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#A3B59D] to-[#e6f2e0]">
      <h1 className="text-3xl font-bold mb-8">Seleziona il tuo evento</h1>
      <div className="flex flex-col gap-4 mb-8">
        {events.map(ev => (
          <button
            key={ev.id}
            className={`px-8 py-4 rounded-xl font-semibold text-lg shadow-md border-2 border-[#A3B59D] bg-white hover:bg-[#A3B59D] hover:text-white transition-all ${selected === ev.id ? "bg-[#A3B59D] text-white" : ""}`}
            onClick={() => handleSelect(ev.id)}
          >
            {ev.name} <span className="ml-2 text-sm text-gray-500">({ev.date})</span>
          </button>
        ))}
      </div>
      <button
        className="px-6 py-3 rounded-xl font-semibold text-lg shadow-md border-2 border-green-400 bg-green-50 hover:bg-green-400 hover:text-white transition-all"
        onClick={handleCreate}
      >
        + Crea nuovo evento
      </button>
    </div>
  );
}
