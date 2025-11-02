import { sendAppointmentReminder } from "@/lib/emailService";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const token = req.nextUrl.searchParams.get("token");
    const isVercelCron = req.headers.get("x-vercel-cron") === "1";
    const authorized = Boolean(
      (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (cronSecret && token === cronSecret) ||
      isVercelCron
    );
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getServiceClient();
    const now = new Date();

    const target7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const target2d = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const date7 = toDateStr(target7d);
    const date2 = toDateStr(target2d);

    const results = { sent7d: 0, sent48h: 0, errors: [] as string[] };

    // Helper to get event emails and owner name
    async function getEventInfo(eventId: string): Promise<{ coupleName: string; emails: string[] }> {
      type EvRow = { id: string; name: string | null; bride_email?: string | null; groom_email?: string | null; owner_id?: string | null };
      const { data: ev } = await db
        .from("events")
        .select("id, name, bride_email, groom_email, owner_id")
        .eq("id", eventId)
        .limit(1)
        .single<EvRow>();
      const emails: string[] = [];
      if (ev?.bride_email) emails.push(ev.bride_email);
      if (ev?.groom_email) emails.push(ev.groom_email);
      // Fallback to owner email if none set on event
      if (emails.length === 0 && ev?.owner_id) {
        try {
          const { data: owner } = await db.auth.admin.getUserById(ev.owner_id);
          if (owner?.user?.email) emails.push(owner.user.email);
        } catch {}
      }
      const coupleName = ev?.name || "Coppia";
      return { coupleName, emails };
    }

    type AppRow = { id: string; event_id: string; title: string; appointment_date: string };

    // 7 days reminders
    {
      const { data: apps7 } = await db
        .from("appointments")
        .select("id, event_id, title, appointment_date")
        .eq("appointment_date", date7)
        .eq("reminder_7d_sent", false)
        .returns<AppRow[]>();

      if (apps7 && apps7.length) {
        for (const a of apps7) {
          const { coupleName, emails } = await getEventInfo(a.event_id);
          for (const email of emails) {
            try {
              await sendAppointmentReminder(email, coupleName, a.title, new Date(a.appointment_date), 7);
              results.sent7d++;
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Unknown";
              results.errors.push(`7d ${a.id}: ${msg}`);
            }
          }
          await db.from("appointments").update({ reminder_7d_sent: true }).eq("id", a.id);
        }
      }
    }

    // 48 hours (2 days) reminders
    {
      const { data: apps2 } = await db
        .from("appointments")
        .select("id, event_id, title, appointment_date")
        .eq("appointment_date", date2)
        .eq("reminder_48h_sent", false)
        .returns<AppRow[]>();

      if (apps2 && apps2.length) {
        for (const a of apps2) {
          const { coupleName, emails } = await getEventInfo(a.event_id);
          for (const email of emails) {
            try {
              await sendAppointmentReminder(email, coupleName, a.title, new Date(a.appointment_date), 2);
              results.sent48h++;
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Unknown";
              results.errors.push(`48h ${a.id}: ${msg}`);
            }
          }
          await db.from("appointments").update({ reminder_48h_sent: true }).eq("id", a.id);
        }
      }
    }

    return NextResponse.json({ success: true, at: now.toISOString(), results });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Cron failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
