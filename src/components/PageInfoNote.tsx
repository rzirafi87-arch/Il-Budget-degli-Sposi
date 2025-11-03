import React from "react";

type PageInfoNoteProps = {
  title: string;
  description: string;
  tips?: string[];
  eventTypeSpecific?: {
    wedding?: string;
    baptism?: string;
    communion?: string;
    confirmation?: string;
    birthday?: string;
    graduation?: string;
    eighteenth?: string;
  };
  icon?: string;
};

/**
 * Componente per mostrare note informative contestuali in ogni pagina.
 * Spiega il funzionamento della pagina e fornisce suggerimenti in base al tipo di evento.
 */
export default function PageInfoNote({ 
  title, 
  description, 
  tips = [], 
  eventTypeSpecific,
  icon = "💡"
}: PageInfoNoteProps) {
  // Leggi il tipo di evento dal localStorage (client-side)
  const [eventType, setEventType] = React.useState<string>("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const type = localStorage.getItem("eventType") || "wedding";
      setEventType(type);
    }
  }, []);

  // Messaggio specifico per tipo di evento
  const eventSpecificMessage = eventTypeSpecific && eventType 
    ? eventTypeSpecific[eventType as keyof typeof eventTypeSpecific]
    : null;

  return (
    <div className="mb-6 p-5 rounded-2xl border-2 border-[#A3B59D]/30 bg-gradient-to-br from-[#A3B59D]/5 to-[#A3B59D]/10 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {description}
          </p>

          {/* Messaggio specifico per tipo di evento */}
          {eventSpecificMessage && (
            <div className="mb-3 p-3 rounded-lg bg-white/60 border border-[#A3B59D]/20">
              <p className="text-sm text-gray-700">
                <strong className="text-[#A3B59D]">Per il tuo evento:</strong> {eventSpecificMessage}
              </p>
            </div>
          )}

          {/* Suggerimenti */}
          {tips.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-600 mb-2">Suggerimenti:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#A3B59D] flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
