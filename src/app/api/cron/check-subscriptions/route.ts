import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { sendSubscriptionExpiryWarning } from "@/lib/emailService";

// Questo endpoint viene chiamato da Vercel Cron
// Configurazione in vercel.json
export async function GET(req: NextRequest) {
  try {
    // Verifica secret (due modalità):
    // 1) Authorization: Bearer <CRON_SECRET>  (per run manuali)
    // 2) Token via query string ?token=<CRON_SECRET> (opzione compatibile con cron esterni)
    // In alternativa, se la richiesta proviene dal Cron di Vercel, è presente l'header x-vercel-cron
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
    
    // Date per i vari controlli
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    const results = {
      expired: 0,
      warnings_sent: 0,
      errors: [] as string[],
    };

    // 1. DOWNGRADE abbonamenti scaduti a "free"
    const { data: expiredSuppliers } = await db
      .from("suppliers")
      .select("id, name, email, subscription_tier, subscription_expires_at")
      .neq("subscription_tier", "free")
      .lt("subscription_expires_at", now.toISOString());

    if (expiredSuppliers && expiredSuppliers.length > 0) {
      for (const supplier of expiredSuppliers) {
        await db
          .from("suppliers")
          .update({ 
            subscription_tier: "free",
            is_featured: false,
          })
          .eq("id", supplier.id);

        results.expired++;
        console.log(`✓ Downgraded supplier ${supplier.name} to free tier`);
      }
    }

    // Stesso per locations
    const { data: expiredLocations } = await db
      .from("locations")
      .select("id, name, subscription_tier, subscription_expires_at")
      .neq("subscription_tier", "free")
      .lt("subscription_expires_at", now.toISOString());

    if (expiredLocations && expiredLocations.length > 0) {
      for (const location of expiredLocations) {
        await db
          .from("locations")
          .update({ 
            subscription_tier: "free",
            is_featured: false,
          })
          .eq("id", location.id);

        results.expired++;
      }
    }

    // Stesso per churches
    const { data: expiredChurches } = await db
      .from("churches")
      .select("id, name, subscription_tier, subscription_expires_at")
      .neq("subscription_tier", "free")
      .lt("subscription_expires_at", now.toISOString());

    if (expiredChurches && expiredChurches.length > 0) {
      for (const church of expiredChurches) {
        await db
          .from("churches")
          .update({ 
            subscription_tier: "free",
            is_featured: false,
          })
          .eq("id", church.id);

        results.expired++;
      }
    }

    // 2. INVIA EMAIL di warning per abbonamenti in scadenza
    const warningThresholds = [
      { days: 7, label: "7 giorni", date: in7Days },
      { days: 3, label: "3 giorni", date: in3Days },
      { days: 1, label: "1 giorno", date: in1Day },
    ];

    for (const threshold of warningThresholds) {
      const { data: soonExpiring } = await db
        .from("suppliers")
        .select("id, name, email, subscription_tier, subscription_expires_at")
        .neq("subscription_tier", "free")
        .gte("subscription_expires_at", now.toISOString())
        .lte("subscription_expires_at", threshold.date.toISOString());

      if (soonExpiring && soonExpiring.length > 0) {
        for (const supplier of soonExpiring) {
          if (!supplier.email) continue;

          const expiresAt = new Date(supplier.subscription_expires_at);
          const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          try {
            await sendSubscriptionExpiryWarning(
              supplier.email,
              supplier.name,
              supplier.subscription_tier,
              expiresAt,
              daysRemaining
            );

            results.warnings_sent++;
            console.log(`✓ Sent ${threshold.label} warning to ${supplier.name}`);
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            results.errors.push(`Email failed for ${supplier.name}: ${message}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Cron job failed";
    console.error("CRON JOB error:", e);
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status: 500 });
  }
}
