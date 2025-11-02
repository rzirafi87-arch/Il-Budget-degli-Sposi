"use client";

<<<<<<< ours
import ExportButton from "@/components/ExportButton";
import PageInfoNote from "@/components/PageInfoNote";
import { formatDate } from "@/lib/locale";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useEffect, useState } from "react";
=======
import { useEffect, useMemo, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";
import ExportButton from "@/components/ExportButton";
import { getEventConfig, resolveEventType, DEFAULT_EVENT_TYPE, TimelineBucket } from "@/constants/eventConfigs";
>>>>>>> theirs

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

export default function TimelinePage() {
  const [eventType, setEventType] = useState<string>(DEFAULT_EVENT_TYPE);
  const eventConfig = getEventConfig(eventType);

  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tutti");

  // Recupera tipo evento da storage/cookie
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cookieMatch = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
    const stored = window.localStorage.getItem("eventType");
    const resolved = resolveEventType(stored || cookieMatch || DEFAULT_EVENT_TYPE);
    setEventType(resolved);
  }, []);

  // Carica data evento e genera timeline
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const jwt = sessionData.session?.access_token;
        if (jwt) {
          const res = await fetch("/api/event/resolve", {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          const json = await res.json();
          if (active && json.event?.wedding_date) {
            setEventDate(new Date(json.event.wedding_date));
          }
        }
      } catch (error) {
        console.error("Errore recupero evento", error);
        if (active) setEventDate(null);
      } finally {
        if (active) {
          const generatedTasks: TimelineTask[] = eventConfig.timelineTasks.map((task, idx) => ({
            ...task,
            id: `${eventType}-task-${idx}`,
            completed: false,
          }));
          setTasks(generatedTasks);
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [eventConfig, eventType]);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const categories = useMemo(() => ["Tutti", ...Array.from(new Set(tasks.map((t) => t.category)))], [tasks]);

  const filteredTasks = useMemo(
    () => (selectedCategory === "Tutti" ? tasks : tasks.filter((task) => task.category === selectedCategory)),
    [selectedCategory, tasks]
  );

  const getTasksForBucket = (bucket: TimelineBucket) => {
    const min = bucket.minMonthsBefore;
    const max = bucket.maxMonthsBefore ?? bucket.minMonthsBefore;
    const upper = Number.isFinite(max) ? max : Number.POSITIVE_INFINITY;
    return filteredTasks.filter((task) => task.monthsBefore >= min && task.monthsBefore <= upper);
  };

  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);
  const progressPercent = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Caricamento timeline...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="hidden md:flex items-center justify-between">
        <div />
<<<<<<< ours
        <a href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">Torna in Dashboard</a>
=======
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"
        >
          ← Torna in Dashboard
        </a>
>>>>>>> theirs
      </div>
      <div className="bg-linear-to-br from-[#FDFBF7] to-[#F5F1EB] rounded-2xl p-6 border border-gray-200 shadow-sm relative">
        <h1 className="font-serif text-3xl font-bold text-gray-800 mb-2">
<<<<<<< ours
          Timeline del Matrimonio
        </h1>
        <p className="text-gray-600">
          Organizzate ogni fase della pianificazione senza stress. Spuntate le attività man mano che le completate! ✨
        </p>
        <a href="/dashboard" className="absolute top-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50">Torna in Dashboard</a>
      </div>

      <PageInfoNote
        icon="📅"
        title="Timeline Organizzativa del Tuo Evento"
        description="La timeline è una checklist cronologica che ti guida passo-passo nella pianificazione. Ogni task è posizionato temporalmente (mesi prima dell'evento) e categorizzato per priorità. Spunta le attività completate per monitorare i progressi e assicurarti di non dimenticare nulla."
        tips={[
          "Le attività sono organizzate per 'mesi prima' - più lontane sono, prima dovresti occupartene",
          "Usa le priorità per capire cosa è urgente (alta) e cosa può aspettare (bassa)",
          "Aggiungi task personalizzate per esigenze specifiche del tuo evento",
          "Filtra per categoria (Budget, Fornitori, Abiti, etc.) per focalizzarti su un'area alla volta",
          "Esporta la timeline in CSV per condividerla con partner, famiglia o wedding planner"
        ]}
        eventTypeSpecific={{
          wedding: "La timeline del matrimonio copre 12 mesi di preparazione, dalle prime decisioni (budget, location) fino ai dettagli finali (tableau, segnaposto). Segui questa roadmap per un'organizzazione serena!",
          baptism: "La timeline del battesimo è più breve (3-6 mesi): chiesa, padrini, bomboniere, rinfresco. Concentrati sugli aspetti religiosi e la celebrazione familiare.",
          birthday: "La timeline del compleanno dipende dalla grandezza: per feste importanti (18, 30, 50 anni) inizia 3-4 mesi prima con location e catering.",
          graduation: "La timeline della laurea è concentrata (1-2 mesi): location, inviti, buffet/pranzo, decorazioni. Ricorda che molti laureati organizzano anche un viaggio!"
        }}
      />

      {/* Progress Overview */}
=======
          {eventConfig.emoji} {eventConfig.timelineTitle}
        </h1>
        <p className="text-gray-600">{eventConfig.timelineDescription}</p>
        <a
          href="/dashboard"
          className="absolute top-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm bg-white border-gray-300 hover:bg-gray-50"
        >
          <span aria-hidden="true">🏠</span> Torna in Dashboard
        </a>
      </div>

>>>>>>> theirs
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <h3 className="font-bold text-lg">I vostri progressi</h3>
          <div className="flex items-center gap-3">
            <ExportButton
              data={tasks.map((task) => ({
                task: task.title,
                descrizione: task.description,
                categoria: task.category,
                priorita: task.priority,
                completato: task.completed ? "Sì" : "No",
              }))}
              filename={`timeline-${eventType}`}
              type="csv"
              className="text-sm"
            >
              Esporta
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
              background: "var(--color-sage)",
            }}
          />
        </div>
<<<<<<< ours
        <p className="text-sm text-gray-500 text-center">
          {progressPercent < 30 
            ? "Appena iniziato - siete sulla strada giusta!"
            : progressPercent < 70
            ? "State andando alla grande! Continuate cosi!"
            : progressPercent < 100
            ? "Quasi pronti! Mancano gli ultimi dettagli!"
            : "Tutto fatto! Siete pronti per il grande giorno!"}
=======
        <p className="text-sm text-gray-600">
          Hai completato il {progressPercent}% della timeline. Continua così!
>>>>>>> theirs
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm font-medium text-gray-700">Filtra per categoria:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-full px-4 py-2 text-sm"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6">
        {eventConfig.timelineBuckets.map((bucket) => {
          const bucketTasks = getTasksForBucket(bucket);
          if (bucketTasks.length === 0) return null;
          return (
<<<<<<< ours
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
                        className={`mt-1 w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                          task.completed 
                            ? "border-green-500 bg-green-500" 
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {task.completed && <span className="text-white text-sm font-bold">âœ“</span>}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                            {task.title}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            task.priority === "alta" 
=======
            <div key={bucket.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{bucket.label}</h3>
              <div className="space-y-3">
                {bucketTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      aria-label={task.completed ? "Segna come da completare" : "Segna come completato"}
                      className={`mt-1 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
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
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            task.priority === "alta"
>>>>>>> theirs
                              ? "bg-red-100 text-red-700"
                              : task.priority === "media"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{task.category}</span>
                      </div>
                      <p className={`text-sm ${task.completed ? "text-gray-400" : "text-gray-600"}`}>{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

<<<<<<< ours
      {weddingDate && (
        <div className="bg-linear-to-r from-rose-50 to-blue-50 rounded-xl p-6 text-center border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Il vostro matrimonio è il</p>
          <p className="text-xl font-bold text-gray-800">
            {formatDate(weddingDate, {
=======
      {eventDate && (
        <div className="bg-gradient-to-r from-rose-50 to-blue-50 rounded-xl p-6 text-center border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">{eventConfig.eventDateMessage}</p>
          <p className="text-xl font-bold text-gray-800">
            {eventDate.toLocaleDateString("it-IT", {
>>>>>>> theirs
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      )}
    </section>
  );
}




