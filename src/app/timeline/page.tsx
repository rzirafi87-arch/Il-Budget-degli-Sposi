"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";
import ExportButton from "@/components/ExportButton";

const supabase = getBrowserClient();

type TimelineTask = {
  id: string;
  title: string;
  description: string;
  monthsBefore: number;
  category: string;
  completed: boolean;
  priority: "alta" | "media" | "bassa";
};

const DEFAULT_TIMELINE: Omit<TimelineTask, "id" | "completed">[] = [
  // 12+ mesi prima
  { title: "Annuncio Matrimonio", description: "Condividete la notizia con famiglia e amici", monthsBefore: 12, category: "Inizio", priority: "alta" },
  { title: "Definite il budget", description: "Stabilite quanto potete spendere in totale", monthsBefore: 12, category: "Budget", priority: "alta" },
  { title: "Create la lista invitati preliminare", description: "Numero approssimativo di ospiti", monthsBefore: 12, category: "Invitati", priority: "alta" },
  
  // 10-11 mesi prima
  { title: "Scegliete la data del matrimonio", description: "Considerate stagione, disponibilità location", monthsBefore: 11, category: "Pianificazione", priority: "alta" },
  { title: "Cercate e prenotate la location", description: "Ricevimento e eventualmente cerimonia", monthsBefore: 10, category: "Location", priority: "alta" },
  { title: "Prenotate il fotografo/videomaker", description: "I migliori si prenotano con molto anticipo", monthsBefore: 10, category: "Fornitori", priority: "alta" },
  
  // 8-9 mesi prima
  { title: "Scegliete i testimoni e le damigelle", description: "Chiedete alle persone speciali di farne parte", monthsBefore: 9, category: "Cerimonia", priority: "media" },
  { title: "Prenotate il catering", description: "Menu degustazione e accordi", monthsBefore: 9, category: "Catering", priority: "alta" },
  { title: "Cercate l'abito da sposa", description: "Visitate atelier e boutique", monthsBefore: 8, category: "Abiti", priority: "alta" },
  { title: "Prenotate la musica (DJ o band)", description: "Cerimonia e/o ricevimento", monthsBefore: 8, category: "Intrattenimento", priority: "media" },
  
  // 6-7 mesi prima
  { title: "Scegliete l'abito dello sposo", description: "Acquisto o noleggio", monthsBefore: 7, category: "Abiti", priority: "alta" },
  { title: "Prenotate il fioraio", description: "Bouquet, centrotavola, allestimenti", monthsBefore: 7, category: "Fornitori", priority: "media" },
  { title: "Inviate i Save the Date", description: "Avvisate gli ospiti della data", monthsBefore: 6, category: "Inviti", priority: "media" },
  { title: "Prenotate l'hotel per gli ospiti", description: "Blocco camere per chi viene da fuori", monthsBefore: 6, category: "Logistica", priority: "bassa" },
  
  // 4-5 mesi prima
  { title: "Ordinare le partecipazioni", description: "Grafica, stampa e buste", monthsBefore: 5, category: "Inviti", priority: "media" },
  { title: "Provare l'abito da sposa", description: "Prima prova e modifiche", monthsBefore: 5, category: "Abiti", priority: "alta" },
  { title: "Prenotare parrucchiera e make-up", description: "Prova trucco e acconciatura", monthsBefore: 4, category: "Beauty", priority: "media" },
  { title: "Scegliere le fedi nuziali", description: "Visitate gioiellerie", monthsBefore: 4, category: "Accessori", priority: "alta" },
  
  // 2-3 mesi prima
  { title: "Spedire le partecipazioni", description: "Almeno 8 settimane prima", monthsBefore: 3, category: "Inviti", priority: "alta" },
  { title: "Finalizzare il menù", description: "Confermare scelte con catering", monthsBefore: 3, category: "Catering", priority: "alta" },
  { title: "Acquistare le scarpe", description: "Sposa e sposo, iniziate a rodarle", monthsBefore: 2, category: "Accessori", priority: "media" },
  { title: "Prenotare la luna di miele", description: "Voli, hotel, attività", monthsBefore: 2, category: "Viaggio", priority: "media" },
  
  // 1 mese prima
  { title: "Ultima prova abiti", description: "Sposa e sposo", monthsBefore: 1, category: "Abiti", priority: "alta" },
  { title: "Confermare numero ospiti", description: "RSVP definitivi", monthsBefore: 1, category: "Invitati", priority: "alta" },
  { title: "Decidere la disposizione tavoli", description: "Tableau e segnaposto", monthsBefore: 1, category: "Allestimento", priority: "media" },
  { title: "Prova trucco e acconciatura", description: "Trial completo", monthsBefore: 1, category: "Beauty", priority: "alta" },
  
  // 2 settimane prima
  { title: "Confermare con tutti i fornitori", description: "Orari, dettagli, pagamenti", monthsBefore: 0.5, category: "Fornitori", priority: "alta" },
  { title: "Preparare la borsa per il giorno", description: "Kit emergenza sposi", monthsBefore: 0.5, category: "Preparazione", priority: "media" },
  { title: "Preparare le buste per fornitori", description: "Pagamenti e mance", monthsBefore: 0.5, category: "Budget", priority: "media" },
  
  // 1 settimana prima
  { title: "Ritiro abiti finali", description: "Controllare che sia tutto perfetto", monthsBefore: 0.25, category: "Abiti", priority: "alta" },
  { title: "Fare le valigie per luna di miele", description: "Preparare i documenti", monthsBefore: 0.25, category: "Viaggio", priority: "bassa" },
  { title: "Rilassarsi e godersi l'attesa!", description: "Massaggio, cena romantica, riposo", monthsBefore: 0.1, category: "Benessere", priority: "alta" },
];

export default function TimelinePage() {
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tutti");

  useEffect(() => {
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const jwt = sessionData.session?.access_token;

        if (jwt) {
          const res = await fetch("/api/event/resolve", {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          const json = await res.json();
          
          if (json.event?.wedding_date) {
            setWeddingDate(new Date(json.event.wedding_date));
          }
        }

        // Genera tasks da default timeline
        const generatedTasks: TimelineTask[] = DEFAULT_TIMELINE.map((task, idx) => ({
          ...task,
          id: `task-${idx}`,
          completed: false,
        }));
        
        setTasks(generatedTasks);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const categories = ["Tutti", ...Array.from(new Set(tasks.map(t => t.category)))];
  const filteredTasks = selectedCategory === "Tutti" 
    ? tasks 
    : tasks.filter(t => t.category === selectedCategory);

  const getTasksForMonth = (month: number) => {
    return filteredTasks.filter(t => {
      const monthValue = t.monthsBefore;
      if (month === 12) return monthValue >= 12;
      if (month === 0) return monthValue < 1;
      return Math.floor(monthValue) === month;
    });
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const monthLabels = [
    { value: 12, label: "12+ mesi prima" },
    { value: 11, label: "11 mesi prima" },
    { value: 10, label: "10 mesi prima" },
    { value: 9, label: "9 mesi prima" },
    { value: 8, label: "8 mesi prima" },
    { value: 7, label: "7 mesi prima" },
    { value: 6, label: "6 mesi prima" },
    { value: 5, label: "5 mesi prima" },
    { value: 4, label: "4 mesi prima" },
    { value: 3, label: "3 mesi prima" },
    { value: 2, label: "2 mesi prima" },
    { value: 1, label: "1 mese prima" },
    { value: 0, label: "Ultime settimane" },
  ];

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Caricamento timeline...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between hidden">
        <div />
        <a href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">← Torna in Dashboard</a>
      </div>
      <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F5F1EB] rounded-2xl p-6 border border-gray-200 shadow-sm relative">
        <h1 className="font-serif text-3xl font-bold text-gray-800 mb-2">
          📅 Timeline del Matrimonio
        </h1>
        <p className="text-gray-600">
          Organizzate ogni fase della pianificazione senza stress. Spuntate le attività man mano che le completate! 💍
        </p>
        <a href="/dashboard" className="absolute top-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"><span aria-hidden="true">🏠</span> Torna in Dashboard</a>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <h3 className="font-bold text-lg">I vostri progressi</h3>
          <div className="flex items-center gap-3">
            <ExportButton
              data={tasks.map(t => ({
                task: t.title,
                descrizione: t.description,
                categoria: t.category,
                priorita: t.priority,
                completato: t.completed ? "Sì" : "No",
              }))}
              filename="timeline-matrimonio"
              type="csv"
              className="text-sm"
            >
              📥 Esporta
            </ExportButton>
            <span className="text-2xl font-bold" style={{ color: "var(--color-sage)" }}>
              {completedCount}/{tasks.length}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progressPercent}%`,
              background: "var(--color-sage)"
            }}
          />
        </div>
        <p className="text-sm text-gray-500 text-center">
          {progressPercent < 30 
            ? "🌱 Appena iniziato — siete sulla strada giusta!"
            : progressPercent < 70
            ? "🎯 State andando alla grande! Continuate così!"
            : progressPercent < 100
            ? "🎉 Quasi pronti! Mancano gli ultimi dettagli!"
            : "✨ Tutto fatto! Siete pronti per il grande giorno!"}
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "text-white shadow-md"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            style={selectedCategory === cat ? { background: "var(--color-sage)" } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {monthLabels.map(({ value, label }) => {
          const monthTasks = getTasksForMonth(value);
          if (monthTasks.length === 0) return null;

          return (
            <div key={value} className="relative">
              <div className="sticky top-20 z-10 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200 shadow-sm mb-4 inline-block">
                <h3 className="font-bold text-lg" style={{ color: "var(--color-sage)" }}>
                  {label}
                </h3>
              </div>

              <div className="space-y-3 pl-4 border-l-2" style={{ borderColor: "var(--color-beige)" }}>
                {monthTasks.map(task => (
                  <div
                    key={task.id}
                    className={`bg-white rounded-xl p-4 border-2 transition-all hover:shadow-md ${
                      task.completed ? "border-green-300 bg-green-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          task.completed 
                            ? "border-green-500 bg-green-500" 
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {task.completed && <span className="text-white text-sm font-bold">✓</span>}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                            {task.title}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            task.priority === "alta" 
                              ? "bg-red-100 text-red-700"
                              : task.priority === "media"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {task.category}
                          </span>
                        </div>
                        <p className={`text-sm ${task.completed ? "text-gray-400" : "text-gray-600"}`}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {weddingDate && (
        <div className="bg-gradient-to-r from-rose-50 to-blue-50 rounded-xl p-6 text-center border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Il vostro matrimonio è il</p>
          <p className="text-xl font-bold text-gray-800">
            {weddingDate.toLocaleDateString("it-IT", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </p>
        </div>
      )}
    </section>
  );
}
