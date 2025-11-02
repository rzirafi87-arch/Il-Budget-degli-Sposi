"use client";



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

      </div>
      <div className="bg-linear-to-br from-[#FDFBF7] to-[#F5F1EB] rounded-2xl p-6 border border-gray-200 shadow-sm relative">
        <h1 className="font-serif text-3xl font-bold text-gray-800 mb-2">

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




