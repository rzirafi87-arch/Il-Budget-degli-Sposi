"use client";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

type CurrentEvent = {
  eventId: string;
  name: string | null;
  eventType: string;
  accessRole: "owner" | "partner" | "legacy";
};
type DeletePayload = { remainingCount: number; error?: string };

export default function EventDeletionSection() {
  const locale = useLocale(),
    t = useTranslations("runtimeUi.eventDeletion"),
    titleId = useId(),
    descriptionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null),
    inputRef = useRef<HTMLInputElement>(null);
  const [event, setEvent] = useState<CurrentEvent | null>(null),
    [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  function closeDialog() {
    setOpen(false);
    setConfirmation("");
    setError(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  useEffect(() => {
    void getBrowserClient()
      .auth.getSession()
      .then(async ({ data }) => {
        const jwt = data.session?.access_token;
        if (!jwt) return;
        const response = await fetch("/api/my/current-event", {
          headers: { Authorization: `Bearer ${jwt}` },
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          status: string;
          currentEvent: CurrentEvent | null;
        };
        if (
          payload.status === "RESOLVED" &&
          payload.currentEvent?.accessRole === "owner"
        )
          setEvent(payload.currentEvent);
      });
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === "Escape" && !busy) closeDialog();
      if (keyEvent.key !== "Tab") return;
      const focusable = inputRef.current
        ?.closest('[role="dialog"]')
        ?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), input:not([disabled])",
        );
      if (!focusable?.length) return;
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (keyEvent.shiftKey && document.activeElement === first) {
        keyEvent.preventDefault();
        last.focus();
      } else if (!keyEvent.shiftKey && document.activeElement === last) {
        keyEvent.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, busy]);

  if (!event) return null;
  const currentEvent = event;
  const expectedName = currentEvent.name?.trim() || currentEvent.eventType,
    valid = confirmation.trim() === expectedName;
  async function deleteEvent() {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await getBrowserClient().auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) throw new Error("NOT_AUTHENTICATED");
      const response = await fetch("/api/event/delete", {
        method: "DELETE",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: currentEvent.eventId,
          confirmationName: confirmation,
        }),
      });
      const payload = (await response.json()) as DeletePayload;
      if (!response.ok) throw new Error(payload.error || "EVENT_DELETE_FAILED");
      localStorage.removeItem("eventType");
      localStorage.removeItem("currentEventChangedAt");
      window.dispatchEvent(
        new CustomEvent("current-event-deleted", {
          detail: currentEvent.eventId,
        }),
      );
      window.location.replace(
        payload.remainingCount === 0
          ? `/${locale}/select-language`
          : `/${locale}/dashboard`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "EVENT_DELETE_FAILED");
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  return (
    <section
      className="mt-10 space-y-3 border-t pt-6"
      aria-labelledby={`${titleId}-section`}
    >
      <h2
        id={`${titleId}-section`}
        className="text-xl font-semibold text-red-700 dark:text-red-400"
      >
        {t("title")}
      </h2>
      <p className="text-sm text-muted-fg">
        {t("description", { event: expectedName })}
      </p>
      <button
        ref={triggerRef}
        type="button"
        className="app-button app-button-ghost text-red-700 dark:text-red-400"
        onClick={() => setOpen(true)}
      >
        {t("open")}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-black/55 p-3 sm:p-4"
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="my-auto w-full max-w-md rounded-2xl border border-border bg-bg p-4 text-fg shadow-2xl sm:p-6"
          >
            <h2
              id={titleId}
              className="text-xl font-bold text-red-700 dark:text-red-400"
            >
              {t("confirmTitle")}
            </h2>
            <p id={descriptionId} className="mt-2 text-sm text-muted-fg">
              {t("consequences", { event: expectedName })}
            </p>
            <p className="mt-4 break-words rounded-xl bg-card p-3 font-semibold">
              {expectedName}
            </p>
            <label className="mt-4 block text-sm font-medium">
              {t("typeName", { event: expectedName })}
              <input
                ref={inputRef}
                className="mt-2 block min-h-11 w-full rounded-xl border border-border bg-bg px-3 text-fg"
                value={confirmation}
                disabled={busy}
                autoComplete="off"
                onChange={(change) => setConfirmation(change.target.value)}
              />
            </label>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="app-button app-button-ghost"
                disabled={busy}
                onClick={closeDialog}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                className="app-button app-button-ghost bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                disabled={!valid || busy}
                onClick={() => void deleteEvent()}
              >
                {busy ? t("deleting") : t("confirm")}
              </button>
            </div>
            <div
              className="mt-3 min-h-6"
              aria-live="assertive"
              aria-atomic="true"
            >
              {error && (
                <p
                  role="alert"
                  className="text-sm text-red-700 dark:text-red-400"
                >
                  {t("error", { code: error })}
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
