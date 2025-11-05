#!/usr/bin/env node

/**
 * Seed script per popolare event_types, event_type_categories, 
 * event_type_subcategories e event_timelines
 * 
 * Uso:
 *   node scripts/seed-event-types.mjs
 * 
 * Prerequisiti:
 *   - .env.local configurato con NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE
 *   - Schema PATCH 18 v2 applicato su Supabase
 * 
 * NOTA: Usa i nuovi nomi tabella (event_type_categories, event_type_subcategories)
 *       per evitare conflitti con categories/subcategories esistenti (per-evento)
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// Carica .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "..", ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error("❌ Errore: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE richiesti in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

// =====================================================================
// Definizioni Event Types
// =====================================================================

const eventTypes = [
  { code: "WEDDING", name: "Matrimonio", locale: "it-IT" },
  { code: "BAPTISM", name: "Battesimo", locale: "it-IT" },
  { code: "COMMUNION", name: "Prima Comunione", locale: "it-IT" },
  { code: "CONFIRMATION", name: "Cresima", locale: "it-IT" },
  { code: "GRADUATION", name: "Laurea", locale: "it-IT" },
  { code: "ANNIVERSARY", name: "Anniversario", locale: "it-IT" },
  { code: "BABY_SHOWER", name: "Baby Shower", locale: "it-IT" },
  { code: "GENDER_REVEAL", name: "Gender Reveal", locale: "it-IT" },
  { code: "ENGAGEMENT", name: "Fidanzamento", locale: "it-IT" },
  { code: "PROPOSAL", name: "Proposta di Matrimonio", locale: "it-IT" },
  { code: "BIRTHDAY_18", name: "Diciottesimo Compleanno", locale: "it-IT" },
  { code: "BIRTHDAY_50", name: "50° Compleanno", locale: "it-IT" },
  { code: "RETIREMENT", name: "Pensionamento", locale: "it-IT" },
];

// =====================================================================
// Categorie e Sottocategorie per WEDDING
// =====================================================================

const weddingCategories = [
  {
    name: "Location & Catering",
    icon: "MapPin",
    subcategories: [
      { name: "Affitto location", default_budget: 3000 },
      { name: "Catering (cibo)", default_budget: 5000 },
      { name: "Torta nuziale", default_budget: 500 },
      { name: "Open bar", default_budget: 1500 },
      { name: "Servizio sala", default_budget: 800 },
    ],
  },
  {
    name: "Cerimonia",
    icon: "Church",
    subcategories: [
      { name: "Chiesa/Comune", default_budget: 500 },
      { name: "Fiori chiesa", default_budget: 300 },
      { name: "Musica cerimonia", default_budget: 600 },
      { name: "Libretto messa", default_budget: 150 },
    ],
  },
  {
    name: "Foto & Video",
    icon: "Camera",
    subcategories: [
      { name: "Fotografo", default_budget: 2000 },
      { name: "Videomaker", default_budget: 1500 },
      { name: "Drone", default_budget: 300 },
      { name: "Album fotografico", default_budget: 400 },
    ],
  },
  {
    name: "Sposa",
    icon: "User",
    subcategories: [
      { name: "Abito sposa", default_budget: 2000 },
      { name: "Scarpe", default_budget: 200 },
      { name: "Accessori (velo, gioielli)", default_budget: 300 },
      { name: "Parrucchiere e trucco", default_budget: 250 },
    ],
  },
  {
    name: "Sposo",
    icon: "User",
    subcategories: [
      { name: "Abito sposo", default_budget: 800 },
      { name: "Scarpe", default_budget: 150 },
      { name: "Accessori (gemelli, cravatta)", default_budget: 100 },
      { name: "Barbiere", default_budget: 50 },
    ],
  },
  {
    name: "Intrattenimento",
    icon: "Music",
    subcategories: [
      { name: "Band/DJ ricevimento", default_budget: 1200 },
      { name: "Animazione bambini", default_budget: 300 },
      { name: "Photobooth", default_budget: 400 },
    ],
  },
  {
    name: "Allestimenti",
    icon: "Flower2",
    subcategories: [
      { name: "Fiori e decorazioni", default_budget: 1000 },
      { name: "Centrotavola", default_budget: 400 },
      { name: "Tableau de mariage", default_budget: 150 },
      { name: "Wedding sign", default_budget: 100 },
    ],
  },
  {
    name: "Partecipazioni & Bomboniere",
    icon: "Gift",
    subcategories: [
      { name: "Partecipazioni", default_budget: 300 },
      { name: "Bomboniere", default_budget: 500 },
      { name: "Confetti", default_budget: 150 },
      { name: "Confettata", default_budget: 200 },
    ],
  },
  {
    name: "Auto & Trasporti",
    icon: "Car",
    subcategories: [
      { name: "Auto sposi", default_budget: 400 },
      { name: "Auto invitati", default_budget: 300 },
    ],
  },
  {
    name: "Anelli & Fedi",
    icon: "Gem",
    subcategories: [
      { name: "Fedi nuziali", default_budget: 1500 },
      { name: "Anello di fidanzamento", default_budget: 2000 },
    ],
  },
  {
    name: "Viaggio di Nozze",
    icon: "Plane",
    subcategories: [
      { name: "Volo", default_budget: 1500 },
      { name: "Hotel", default_budget: 2000 },
      { name: "Escursioni", default_budget: 500 },
    ],
  },
];

// =====================================================================
// Timeline standard per WEDDING (esempi)
// =====================================================================

const weddingTimeline = [
  { title: "Scegli la data del matrimonio", offset_days: -365, category: "PLANNING", is_critical: true },
  { title: "Scegli location ricevimento", offset_days: -330, category: "PLANNING", is_critical: true },
  { title: "Scegli fotografo e videomaker", offset_days: -300, category: "PLANNING", is_critical: false },
  { title: "Ordina abito sposa", offset_days: -270, category: "PLANNING", is_critical: true },
  { title: "Invia save the date", offset_days: -240, category: "PLANNING", is_critical: false },
  { title: "Prenota band/DJ", offset_days: -210, category: "PLANNING", is_critical: false },
  { title: "Ordina partecipazioni", offset_days: -180, category: "PLANNING", is_critical: true },
  { title: "Prenota viaggio di nozze", offset_days: -150, category: "PLANNING", is_critical: false },
  { title: "Invia partecipazioni", offset_days: -120, category: "PLANNING", is_critical: true },
  { title: "Prova abito finale", offset_days: -60, category: "PLANNING", is_critical: true },
  { title: "Conferma numero invitati", offset_days: -30, category: "PLANNING", is_critical: true },
  { title: "Prova trucco e acconciatura", offset_days: -15, category: "PLANNING", is_critical: false },
  { title: "Giorno del matrimonio!", offset_days: 0, category: "CEREMONY", is_critical: true },
  { title: "Invia thank-you cards", offset_days: 30, category: "POST_EVENT", is_critical: false },
  { title: "Ricevi album fotografico", offset_days: 90, category: "POST_EVENT", is_critical: false },
];

// =====================================================================
// Funzione di seed principale
// =====================================================================

async function seed() {
  console.log("🌱 Inizio seed Event Types, Categories, Subcategories, Timelines...\n");

  // 1. Seed Event Types
  console.log("📌 Seed Event Types...");
  for (const et of eventTypes) {
    const { data, error } = await supabase
      .from("event_types")
      .upsert(et, { onConflict: "code" })
      .select("id, code")
      .single();

    if (error) {
      console.error(`   ❌ Errore su ${et.code}:`, error.message);
    } else {
      console.log(`   ✅ ${et.code} (${data.id})`);
      et._id = data.id; // Salva ID per riferimenti successivi
    }
  }

  // 2. Seed Categories e Subcategories per WEDDING
  const weddingType = eventTypes.find((et) => et.code === "WEDDING");
  if (!weddingType?._id) {
    console.error("❌ Impossibile trovare WEDDING event type");
    return;
  }

  console.log("\n📌 Seed Categories e Subcategories per WEDDING...");
  for (const [catIndex, cat] of weddingCategories.entries()) {
    const { data: catData, error: catError } = await supabase
      .from("event_type_categories") // TABELLA TEMPLATE GLOBALE
      .insert({
        event_type_id: weddingType._id,
        name: cat.name,
        icon: cat.icon,
        sort: catIndex,
      })
      .select("id, name")
      .single();

    if (catError) {
      console.error(`   ❌ Errore categoria ${cat.name}:`, catError.message);
      continue;
    }

    console.log(`   ✅ Categoria: ${catData.name} (${catData.id})`);

    // Seed Subcategories
    for (const [subIndex, sub] of cat.subcategories.entries()) {
      const { error: subError } = await supabase.from("event_type_subcategories").insert({
        category_id: catData.id,
        name: sub.name,
        default_budget: sub.default_budget,
        sort: subIndex,
      });

      if (subError) {
        console.error(`      ❌ Errore sottocategoria ${sub.name}:`, subError.message);
      } else {
        console.log(`      ✅ ${sub.name} (budget: €${sub.default_budget})`);
      }
    }
  }

  // 3. Seed Timeline per WEDDING
  console.log("\n📌 Seed Timeline per WEDDING...");
  for (const milestone of weddingTimeline) {
    const { error } = await supabase.from("event_timelines").insert({
      event_type_id: weddingType._id,
      title: milestone.title,
      offset_days: milestone.offset_days,
      category: milestone.category,
      is_critical: milestone.is_critical,
    });

    if (error) {
      console.error(`   ❌ Errore milestone ${milestone.title}:`, error.message);
    } else {
      const days = milestone.offset_days;
      const when = days < 0 ? `${Math.abs(days)} giorni prima` : days === 0 ? "giorno evento" : `${days} giorni dopo`;
      console.log(`   ✅ ${milestone.title} (${when})`);
    }
  }

  console.log("\n✅ Seed completato con successo!");
}

// Esegui seed
seed()
  .then(() => {
    console.log("\n🎉 Seed terminato!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Errore seed:", error);
    process.exit(1);
  });
