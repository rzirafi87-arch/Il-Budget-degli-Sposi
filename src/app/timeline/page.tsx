"use client";

import { useEffect, useMemo, useState } from "react";
import ExportButton from "@/components/ExportButton";
import {
  DEFAULT_EVENT_TYPE,
  TimelineBucket,
  getEventConfig,
  resolveEventType,
} from "@/constants/eventConfigs";
import { getBrowserClient } from "@/lib/supabaseBrowser";

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cookieMatch = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
    const stored = window.localStorage.getItem("eventType");
    const resolved = resolveEventType(stored || cookieMatch || DEFAULT_EVENT_TYPE);
    setEventType(resolved);
  }, []);

  useEffect(() => {
    let disposed = false;
    async function loadTimeline() {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const jwt = sessionData.session?.access_token;
        if (jwt) {
          const res = await fetch("/api/event/resolve", {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          if (res.ok) {
            const json = await res.json();
            if (!disposed && json?.event?.wedding_date) {
              setEventDate(new Date(json.event.wedding_date));
            }
          }
        }
      } catch (error) {
        console.error("Errore recupero evento", error);
        if (!disposed) setEventDate(null);
      } finally {
        if (!disposed) {
          const generated = eventConfig.timelineTasks.map((task, index) => ({
            ...task,
            id: `${eventType}-task-${index}`,
            completed: false,
          }));
          setTasks(generated);
          setLoading(false);
        }
      }
    }
    loadTimeline();
    return () => {
      disposed = true;
    };
  }, [eventConfig, eventType]);

  const categories = useMemo(
    () => ["Tutti", ...Array.from(new Set(tasks.map((task) => task.category)))],
    [tasks],
  );

  const filteredTasks = useMemo(
    () =>
      selectedCategory === "Tutti"
        ? tasks
        : tasks.filter((task) => task.category === selectedCategory),
    [selectedCategory, tasks],
  );

  const getTasksForBucket = (bucket: TimelineBucket) => {
    const min = bucket.minMonthsBefore;
    const max =
      bucket.maxMonthsBefore === undefined
        ? Number.POSITIVE_INFINITY
        : bucket.maxMonthsBefore;
    return filteredTasks.filter(
      (task) => task.monthsBefore >= min && task.monthsBefore <= max,
    );
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks],
  );
  const progressPercent =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">
        Caricamento timeline...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{eventConfig.timelineDescription}</p>
          <h1 className="font-serif text-3xl font-bold text-gray-800">
            {eventConfig.emoji} {eventConfig.timelineTitle}
          </h1>
        </div>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
        >
          Torna alla dashboard
        </a>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Hai completato il {progressPercent}% delle attivita.
            </p>
            <div className="mt-2 h-3 w-64 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  background: "var(--color-sage, #8da182)",
                }}
              />
            </div>
          </div>
          <ExportButton
            data={tasks.map((task) => ({
              task: task.title,
              descrizione: task.description,
              categoria: task.category,
              priorita: task.priority,
              completato: task.completed ? "Si" : "No",
            }))}
            filename={`timeline-${eventType}`}
            type="csv"
            className="text-sm"
          >
            Esporta CSV
          </ExportButton>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            Filtra per categoria:
          </label>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {eventConfig.timelineBuckets.map((bucket) => {
          const bucketTasks = getTasksForBucket(bucket);
          if (bucketTasks.length === 0) return null;
          return (
            <div
              key={bucket.label}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {bucket.label}
              </h3>
              <div className="mt-3 space-y-3">
                {bucketTasks.map((task) => (
                  <div key={task.id} className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={`mt-1 h-6 w-6 rounded-full border transition ${
                        task.completed
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-gray-300 text-transparent hover:border-gray-400"
                      }`}
                      aria-label={
                        task.completed
                          ? "Segna come da completare"
                          : "Segna come completato"
                      }
                    >
                      ✓
                    </button>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`font-semibold ${
                            task.completed
                              ? "text-gray-400 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {task.title}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            task.priority === "alta"
                              ? "bg-red-100 text-red-700"
                              : task.priority === "media"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          Priorita {task.priority}
                        </span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          {task.category}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          task.completed ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {task.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {eventDate && (
        <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-rose-50 to-blue-50 p-6 text-center">
          <p className="text-sm text-gray-500">{eventConfig.eventDateMessage}</p>
          <p className="text-xl font-semibold text-gray-800">
            {eventDate.toLocaleDateString("it-IT", {
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
