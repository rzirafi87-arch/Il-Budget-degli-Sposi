import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

/**
 * GET: Carica i dati della dashboard (budget totale + spese)
 * POST: Salva i dati della dashboard
 */

type SpendRow = {
  id?: string;
  category: string;
  subcategory: string;
  supplier: string;
  amount: number;
  spendType: "common" | "bride" | "groom";
  notes: string;
};

// Stesse categorie della dashboard
const CATEGORIES_MAP: Record<string, string[]> = {
  "Abiti & Accessori (altri)": [
    "Abiti ospiti / Genitori",
    "Accessori damigelle",
    "Accessori testimoni",
    "Fedi nuziali",
    "Anello fidanzamento",
    "Accessori vari"
  ],
  "Cerimonia": [
    "Chiesa / Comune",
    "Musiche",
    "Libretti Messa",
    "Fiori cerimonia",
    "Documenti e pratiche",
    "Offerte / Diritti"
  ],
  "Fiori & Decor": [
    "Bouquet",
    "Boutonnière",
    "Centrotavola",
    "Allestimenti",
    "Candele",
    "Tableau",
    "Segnaposto",
    "Noleggi (vasi / strutture)"
  ],
  "Foto & Video": [
    "Servizio fotografico",
    "Video",
    "Drone",
    "Album",
    "Stampe",
    "Secondo fotografo"
  ],
  "Inviti & Stationery": [
    "Partecipazioni",
    "Menu",
    "Segnaposto",
    "Libretti Messa",
    "Timbri / Cliché",
    "Francobolli / Spedizioni",
    "Calligrafia",
    "Cartoncini / Tag",
    "QR Code / Stampa"
  ],
  "Sposa": [
    "Abito sposa",
    "Scarpe sposa",
    "Accessori (velo, gioielli, ecc.)",
    "Intimo / sottogonna",
    "Parrucchiera",
    "Make-up",
    "Prove",
    "Altro sposa"
  ],
  "Sposo": [
    "Abito sposo",
    "Scarpe sposo",
    "Accessori (cravatta, gemelli, ecc.)",
    "Barbiere / Grooming",
    "Prove",
    "Altro sposo"
  ],
  "Location & Catering": [
    "Affitto sala",
    "Catering / Banqueting",
    "Torta nuziale",
    "Vini & Bevande",
    "Open bar",
    "Mise en place",
    "Noleggio tovagliato / piatti"
  ],
  "Musica & Intrattenimento": [
    "DJ / Band",
    "Audio / Luci",
    "Animazione",
    "Diritti SIAE",
    "Guestbook phone / Postazioni"
  ],
  "Trasporti": [
    "Auto sposi",
    "Navette ospiti",
    "Carburante / Pedaggi"
  ],
  "Bomboniere & Regali": [
    "Bomboniere",
    "Confetti",
    "Packaging / Scatole",
    "Allestimento tavolo bomboniere"
  ],
  "Ospitalità & Logistica": [
    "Alloggi ospiti",
    "Welcome bag / Kit",
    "Cartellonistica / Segnaletica"
  ],
  "Burocrazia": [
    "Pubblicazioni",
    "Certificati",
    "Traduzioni / Apostille"
  ],
  "Beauty & Benessere": [
    "Estetista",
    "SPA / Massaggi",
    "Solarium"
  ],
  "Viaggio di nozze": [
    "Quota viaggio",
    "Assicurazioni",
    "Visti / Documenti",
    "Extra",
    "Lista nozze"
  ],
  "Comunicazione & Media": [
    "Sito web / QR",
    "Social media",
    "Grafica / Design"
  ],
  "Extra & Contingenze": [
    "Imprevisti",
    "Spese varie"
  ]
};

const ALL_CATEGORIES = Object.keys(CATEGORIES_MAP);

// Genera tutte le righe base
const generateAllRows = (): SpendRow[] => {
  const allRows: SpendRow[] = [];
  let idCounter = 1;
  
  ALL_CATEGORIES.forEach((category) => {
    const subcategories = CATEGORIES_MAP[category] || [];
    subcategories.forEach((subcategory) => {
      allRows.push({
        id: `demo-${idCounter++}`,
        category,
        subcategory,
        supplier: "",
        amount: 0,
        spendType: "common",
        notes: "",
      });
    });
  });
  
  return allRows;
};

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      // Dati demo per utenti non autenticati - TUTTE le righe
      return NextResponse.json({
        totalBudget: 0,
        rows: generateAllRows(),
      });
    }

    const db = getServiceClient();

    // Verifica token
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Prendi il primo evento dell'utente
    const { data: ev, error: e1 } = await db
      .from("events")
      .select("id, total_budget")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();

    if (e1 || !ev?.id) {
      return NextResponse.json({
        totalBudget: 0,
        rows: generateAllRows(), // Prima volta: genera tutte le righe vuote
      });
    }

    const eventId = ev.id;
    const totalBudget = ev.total_budget || 0;

    // Carica tutte le spese con categoria e sottocategoria
    const { data: expenses, error: e2 } = await db
      .from("expenses")
      .select(`
        id,
        supplier,
        committed_amount,
        spend_type,
        notes,
        subcategory:subcategories!inner(
          name,
          category:categories!inner(name, event_id)
        )
      `)
      .eq("subcategory.category.event_id", eventId)
      .order("inserted_at", { ascending: true });

    if (e2) {
      console.error("DASHBOARD GET error:", e2);
      return NextResponse.json({ error: e2.message }, { status: 500 });
    }

    const rows: SpendRow[] = (expenses || []).map((e: any) => ({
      id: e.id,
      category: e.subcategory?.category?.name || "",
      subcategory: e.subcategory?.name || "",
      supplier: e.supplier || "",
      amount: Number(e.committed_amount || 0),
      spendType: e.spend_type || "common",
      notes: e.notes || "",
    }));

    return NextResponse.json({
      totalBudget,
      rows,
    });
  } catch (e: any) {
    console.error("DASHBOARD GET uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ error: "Autenticazione richiesta per salvare" }, { status: 401 });
    }

    const body = await req.json();
    const { totalBudget, rows } = body as { totalBudget: number; rows: SpendRow[] };

    const db = getServiceClient();

    // Verifica token
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Prendi il primo evento dell'utente
    const { data: ev, error: e1 } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();

    if (e1 || !ev?.id) {
      return NextResponse.json({ error: "Nessun evento trovato" }, { status: 404 });
    }

    const eventId = ev.id;

    // 1. Aggiorna il budget totale nell'evento
    await db.from("events").update({ total_budget: totalBudget }).eq("id", eventId);

    // 2. Per ogni riga, crea/aggiorna categoria, sottocategoria e spesa
    for (const row of rows) {
      if (!row.category || !row.subcategory) continue;

      // Trova o crea categoria
      let { data: cat } = await db
        .from("categories")
        .select("id")
        .eq("event_id", eventId)
        .eq("name", row.category)
        .single();

      if (!cat) {
        const { data: newCat } = await db
          .from("categories")
          .insert({ event_id: eventId, name: row.category })
          .select("id")
          .single();
        cat = newCat;
      }

      if (!cat?.id) continue;
      const categoryId = cat.id;

      // Trova o crea sottocategoria
      let { data: sub } = await db
        .from("subcategories")
        .select("id")
        .eq("category_id", categoryId)
        .eq("name", row.subcategory)
        .single();

      if (!sub) {
        const { data: newSub } = await db
          .from("subcategories")
          .insert({ category_id: categoryId, name: row.subcategory })
          .select("id")
          .single();
        sub = newSub;
      }

      if (!sub?.id) continue;
      const subcategoryId = sub.id;

      // Se la riga ha un ID, aggiorna, altrimenti inserisci
      if (row.id && !row.id.startsWith("demo-")) {
        await db
          .from("expenses")
          .update({
            supplier: row.supplier,
            committed_amount: row.amount,
            spend_type: row.spendType,
            notes: row.notes,
            status: "planned",
          })
          .eq("id", row.id);
      } else {
        await db.from("expenses").insert({
          subcategory_id: subcategoryId,
          supplier: row.supplier,
          committed_amount: row.amount,
          spend_type: row.spendType,
          notes: row.notes,
          status: "planned",
          paid_amount: 0,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DASHBOARD POST uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}
