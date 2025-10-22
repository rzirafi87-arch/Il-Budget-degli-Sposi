import { NextResponse } from "next/server";
import { getBrowserClient, getServiceClient } from "@/lib/supabaseServer";

export async function POST() {
  try {
    // 1) Recupera utente autenticato (dal client anon, ma eseguito lato server)
    const browser = getBrowserClient();
    const { data: authData, error: authErr } = await browser.auth.getUser();
    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    const userId = authData.user.id;

    // 2) Crea evento con service client
    const db = getServiceClient();
    const publicId = Math.random().toString(36).slice(2, 10);

    const { data: evt, error: evtErr } = await db
      .from("events")
      .insert({ public_id: publicId, owner_id: userId, name: "Nuovo evento" })
      .select("id, public_id")
      .single();

    if (evtErr || !evt) {
      return NextResponse.json({ error: evtErr?.message ?? "Errore creazione evento" }, { status: 500 });
    }

    // 3) Seed categorie di base
    const { error: seedCatErr } = await db.rpc("seed_categories", { p_event: evt.id });
    if (seedCatErr) {
      return NextResponse.json({ error: seedCatErr.message }, { status: 500 });
    }

    // 4) (Opzionale) seed sottocategorie principali per SPOSA e SPOSO
    const { data: cats, error: catsErr } = await db
      .from("categories")
      .select("id,name")
      .eq("event_id", evt.id);

    if (catsErr) {
      return NextResponse.json({ error: catsErr.message }, { status: 500 });
    }

    const idByName = (n: string) => cats?.find((c) => c.name.toLowerCase() === n.toLowerCase())?.id;

    const sposaId = idByName("Sposa");
    if (sposaId) {
      await db.rpc("seed_subcategories", {
        p_category: sposaId,
        p_names: [
          "Abito sposa",
          "Scarpe sposa",
          "Accessori (velo, gioielli, ecc.)",
          "Intimo / sottogonna",
          "Parrucchiera",
          "Make-up",
          "Prove",
          "Altro sposa",
        ],
      });
    }

    const sposoId = idByName("Sposo");
    if (sposoId) {
      await db.rpc("seed_subcategories", {
        p_category: sposoId,
        p_names: [
          "Abito sposo",
          "Scarpe sposo",
          "Accessori (cravatta, gemelli, ecc.)",
          "Barbiere / Grooming",
          "Prove",
          "Altro sposo",
        ],
      });
    }

    return NextResponse.json({ event: { id: evt.id, public_id: publicId } }, { status: 200 });
  } catch (e: any) {
    console.error("EVENT NEW – Uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}

// utile per test dal browser
export async function GET() {
  return POST();
}
