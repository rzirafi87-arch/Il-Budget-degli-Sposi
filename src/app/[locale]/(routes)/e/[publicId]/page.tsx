/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { getTranslations } from "next-intl/server";

type PublicEvent = {
  id: string;
  public_id: string | null;
  title: string | null;
  is_public: boolean | null;
  created_at: string | null;
  type_id: number | null;
};

async function getPublicEvent(publicId: string) {
  const res = await fetch(`/api/public/${encodeURIComponent(publicId)}`, {
    // ensure fresh data
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    // Try to extract error
    let msg = `Error ${res.status}`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error as string;
    } catch (_) {}
    throw new Error(msg);
  }

  const data = (await res.json()) as { event: PublicEvent };
  return data.event;
}

export default async function PublicEventPage({ params }: { params: { publicId: string; locale: string } }) {
  const { publicId, locale } = params;
  const t = await getTranslations({ locale, namespace: "milestone9.runtime.publicEvent" });
  let event: PublicEvent | null = null;
  let error: string | null = null;

  try {
    event = await getPublicEvent(publicId);
  } catch (e: any) {
    error = e?.message || t("loadFailed");
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-2">{t("title")}</h1>
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-2">{t("title")}</h1>
        <p>{t("loading")}</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">{event.title || t("eventFallback")}</h1>
      <div className="space-y-1 text-sm text-gray-700">
        <div>
          <span className="font-medium">Public ID:</span> {event.public_id || "&mdash;"}
        </div>
        <div>
          <span className="font-medium">{t("visibility")}:</span> {event.is_public ? t("public") : t("private")}
        </div>
        {event.created_at ? (
          <div>
            <span className="font-medium">{t("createdAt")}:</span> {new Date(event.created_at).toLocaleString(locale)}
          </div>
        ) : null}
        {typeof event.type_id === "number" ? (
          <div>
            <span className="font-medium">{t("eventTypeId")}:</span> {event.type_id}
          </div>
        ) : null}
      </div>
    </main>
  );
}
