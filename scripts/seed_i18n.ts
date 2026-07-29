import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "node:path";

// Load .env.local when executing via ts-node
config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE!;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment");
  process.exit(1);
}
const db = createClient(url, key);
const i18n = db.schema("app_i18n");

// helper
async function upsert<T>(table: string, rows: T[], conflict?: string) {
  if (!rows.length) return { data: [], error: null };
  const q = i18n.from(table).upsert(rows, conflict ? { onConflict: conflict } : undefined).select();
  const { data, error } = await q;
  if (error) throw error;
  return { data, error };
}

async function main() {
  // 1) Locales + Countries (aggiornato)
  await upsert("locales", [
    { code: "it-IT", name: "Italiano", direction: "ltr" },
    { code: "en-GB", name: "English", direction: "ltr" },
    { code: "es-ES", name: "Español", direction: "ltr" },
    { code: "fr-FR", name: "Français", direction: "ltr" },
    { code: "de-DE", name: "Deutsch", direction: "ltr" },
    { code: "ar", name: "العربية", direction: "rtl" },
    { code: "hi-IN", name: "हिन्दी", direction: "ltr" },
    { code: "ja-JP", name: "日本語", direction: "ltr" },
    { code: "zh-CN", name: "中文", direction: "ltr" },
    { code: "es-MX", name: "Español (México)", direction: "ltr" },
    { code: "pt-PT", name: "Português", direction: "ltr" },
    { code: "ru-RU", name: "Русский", direction: "ltr" },
    { code: "id-ID", name: "Bahasa Indonesia", direction: "ltr" },
  ], "code");

  await upsert("countries", [
    { code: "IT", name: "Italia", default_locale: "it-IT" },
    { code: "MX", name: "México", default_locale: "es-MX" },
    { code: "GB", name: "United Kingdom", default_locale: "en-GB" },
    { code: "US", name: "United States", default_locale: "en-GB" },
    { code: "JP", name: "日本", default_locale: "ja-JP" },
    { code: "FR", name: "France", default_locale: "fr-FR" },
    { code: "DE", name: "Deutschland", default_locale: "de-DE" },
    { code: "ES", name: "España", default_locale: "es-ES" },
    { code: "CN", name: "中国", default_locale: "zh-CN" },
    { code: "IN", name: "India", default_locale: "hi-IN" },
  ], "code");

  // 2) Event type: WEDDING
  const { data: etIns } = await i18n
    .from("event_types")
    .upsert(
      { code: "WEDDING" },
      { onConflict: "code" }
    )
    .select("*")
    .single();
  if (!etIns) {
    throw new Error("Unable to upsert WEDDING event type");
  }
  const eventTypeId = etIns.id;

  await upsert("event_type_translations", [
    { event_type_id: eventTypeId, locale: "it-IT", name: "Matrimonio" },
    { event_type_id: eventTypeId, locale: "en-GB", name: "Wedding" },
  ], "event_type_id,locale");

  // 3) Categories + Subcategories (IT/EN)
  type Cat = { name_it: string; name_en: string; sub: { it: string; en: string; }[] };
  const cats: Cat[] = [
    {
      name_it: "Location & Catering", name_en: "Venue & Catering",
      sub: [
        { it: "Affitto location", en: "Venue rental" },
        { it: "Catering/Banquet", en: "Catering/Banquet" },
        { it: "Torta nuziale", en: "Wedding cake" },
        { it: "Open bar/Bevande", en: "Open bar/Drinks" },
        { it: "Mise en place", en: "Tableware & setup" },
        { it: "SIAE/Permessi musica", en: "Music licenses/Permits" },
      ]
    },
    {
      name_it: "Cerimonia", name_en: "Ceremony",
      sub: [
        { it: "Chiesa/Comune", en: "Church/Town hall" },
        { it: "Decorazioni cerimonia", en: "Ceremony decor" },
        { it: "Musica cerimonia", en: "Ceremony music" },
        { it: "Officiante/Documenti", en: "Officiant/Documents" },
        { it: "Trasferte cerimonia", en: "Ceremony logistics" },
      ]
    },
    {
      name_it: "Abiti & Beauty", name_en: "Attire & Beauty",
      sub: [
        { it: "Abito sposa", en: "Bride dress" },
        { it: "Abito sposo", en: "Groom suit" },
        { it: "Accessori (velo, scarpe, gioielli)", en: "Accessories (veil, shoes, jewelry)" },
        { it: "Make-up", en: "Make-up" },
        { it: "Parrucchiere", en: "Hair stylist" },
        { it: "Prove e ritocchi", en: "Fittings & alterations" },
      ]
    },
    {
      name_it: "Foto & Video", name_en: "Photo & Video",
      sub: [
        { it: "Fotografo", en: "Photographer" },
        { it: "Videomaker", en: "Videographer" },
        { it: "Drone", en: "Drone" },
        { it: "Album e stampe", en: "Albums & prints" },
        { it: "Anteprima/Engagement shoot", en: "Engagement shoot" },
      ]
    },
    {
      name_it: "Musica & Intrattenimento", name_en: "Music & Entertainment",
      sub: [
        { it: "Band/DJ ricevimento", en: "Reception band/DJ" },
        { it: "Animazione ospiti", en: "Guest entertainment" },
        { it: "SIAE/Permessi extra", en: "Extra licenses" },
        { it: "Audio/Luci", en: "Audio/Lighting" },
      ]
    },
    {
      name_it: "Allestimenti & Fiori", name_en: "Decor & Flowers",
      sub: [
        { it: "Bouquet e bottoniere", en: "Bouquet & boutonnieres" },
        { it: "Centrotavola", en: "Centerpieces" },
        { it: "Backdrop/Arco", en: "Backdrop/Arch" },
        { it: "Noleggio arredi", en: "Furniture rental" },
        { it: "Candele/Illuminazione", en: "Candles/Lighting" },
      ]
    },
    {
      name_it: "Stationery & Digital", name_en: "Stationery & Digital",
      sub: [
        { it: "Save the Date", en: "Save the Date" },
        { it: "Inviti", en: "Invitations" },
        { it: "Libretti cerimonia", en: "Ceremony booklets" },
        { it: "Segnaposto/Tableau", en: "Place cards/Seating plan" },
        { it: "Sito/QR/Guestbook phone", en: "Website/QR/Phone guestbook" },
      ]
    },
    {
      name_it: "Trasporti", name_en: "Transport",
      sub: [
        { it: "Auto sposi", en: "Wedding car" },
        { it: "Navette ospiti", en: "Guest shuttles" },
        { it: "Parcheggi/Permessi", en: "Parking/Permits" },
      ]
    },
    {
      name_it: "Anelli & Gioielli", name_en: "Rings & Jewelry",
      sub: [
        { it: "Fedi nuziali", en: "Wedding rings" },
        { it: "Porta fedi", en: "Ring holder" },
        { it: "Assicurazione", en: "Insurance" },
      ]
    },
    {
      name_it: "Regali & Bomboniere", name_en: "Gifts & Favors",
      sub: [
        { it: "Lista nozze", en: "Registry" },
        { it: "Bomboniere", en: "Favors" },
        { it: "Confezionamento/Consegna", en: "Packaging/Delivery" },
      ]
    },
    {
      name_it: "Ospitalità & Logistica", name_en: "Hospitality & Logistics",
      sub: [
        { it: "Alloggi ospiti", en: "Guest accommodation" },
        { it: "Welcome kit", en: "Welcome kit" },
        { it: "Baby-sitting", en: "Baby-sitting" },
        { it: "Sicurezza/Assistenza", en: "Security/Assistance" },
      ]
    },
    {
      name_it: "Burocrazia & Servizi", name_en: "Admin & Services",
      sub: [
        { it: "Documenti/Atti", en: "Documents" },
        { it: "Assicurazioni evento", en: "Event insurance" },
        { it: "Wedding planner", en: "Wedding planner" },
        { it: "Pulizie/Smontaggio", en: "Cleaning/Teardown" },
      ]
    },
    {
      name_it: "Extra & Imprevisti", name_en: "Extras & Contingency",
      sub: [
        { it: "Fondo imprevisti", en: "Contingency fund" },
        { it: "Mance", en: "Tips/Gratuities" },
        { it: "Extra ultimo minuto", en: "Last-minute extras" },
      ]
    },
  ];

  const stableCode = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const { data: insertedCats } = await upsert(
    "categories",
    cats.map((cat, sort) => ({
      event_type_id: eventTypeId,
      code: stableCode(cat.name_it),
      sort,
    })),
    "event_type_id,code"
  );
  const categoriesByCode = new Map(insertedCats.map((category) => [category.code, category]));

  // translations + subcategories
  for (let i = 0; i < cats.length; i++) {
    const c = cats[i];
    const category = categoriesByCode.get(stableCode(c.name_it));
    if (!category) throw new Error(`Category upsert failed: ${c.name_it}`);
    const catId = category.id;

    await upsert("category_translations", [
      { category_id: catId, locale: "it-IT", name: c.name_it },
      { category_id: catId, locale: "en-GB", name: c.name_en },
    ], "category_id,locale");

    const { data: insertedSubs } = await upsert(
      "subcategories",
      c.sub.map((subcategory, sort) => ({
        category_id: catId,
        code: stableCode(subcategory.it),
        sort,
      })),
      "category_id,code"
    );
    const subcategoriesByCode = new Map(insertedSubs.map((subcategory) => [subcategory.code, subcategory]));

    for (let j = 0; j < c.sub.length; j++) {
      const subcategory = subcategoriesByCode.get(stableCode(c.sub[j].it));
      if (!subcategory) throw new Error(`Subcategory upsert failed: ${c.sub[j].it}`);
      const scId = subcategory.id;
      await upsert("subcategory_translations", [
        { subcategory_id: scId, locale: "it-IT", name: c.sub[j].it },
        { subcategory_id: scId, locale: "en-GB", name: c.sub[j].en },
      ], "subcategory_id,locale");
    }
  }

  // 4) Timeline (neutra + traduzioni)
  const tl: { key: string; offset: number; it: { title: string; desc?: string }, en: { title: string; desc?: string } }[] = [
    { key: "announce-engagement", offset: -365,
      it: { title: "Annunciate il fidanzamento", desc: "Condividete la notizia con chi amate" },
      en: { title: "Announce engagement", desc: "Share the news with loved ones" } },
    { key: "set-budget-style", offset: -330,
      it: { title: "Definite budget e stile", desc: "Scegliete priorità e moodboard" },
      en: { title: "Set budget & style", desc: "Define priorities and moodboard" } },
    { key: "book-venue-date", offset: -300,
      it: { title: "Prenotate location e data", desc: "Blocca location e data con caparra" },
      en: { title: "Book venue & date", desc: "Secure venue and date with deposit" } },
    { key: "photographer", offset: -270,
      it: { title: "Scegli fotografo", desc: "Valuta portfolio e contratto" },
      en: { title: "Choose photographer", desc: "Review portfolio and contract" } },
    { key: "videomaker", offset: -270,
      it: { title: "Scegli videomaker", desc: "Stile e montaggio in linea al mood" },
      en: { title: "Choose videographer", desc: "Match style to your mood" } },
    { key: "church-townhall", offset: -270,
      it: { title: "Chiesa/Comune", desc: "Prenota e verifica documenti" },
      en: { title: "Church/Town hall", desc: "Book and verify documents" } },
    { key: "catering", offset: -240,
      it: { title: "Conferma catering", desc: "Bozza menù e allergie" },
      en: { title: "Confirm catering", desc: "Draft menu and allergies" } },
    { key: "ceremony-music", offset: -210,
      it: { title: "Musica cerimonia", desc: "Trio/Quartetto, prove brani" },
      en: { title: "Ceremony music", desc: "Musicians and rehearsals" } },
    { key: "party-music", offset: -210,
      it: { title: "Musica party", desc: "Band/DJ, playlist e impianto" },
      en: { title: "Party music", desc: "Band/DJ, playlist & PA" } },
    { key: "save-the-date", offset: -210,
      it: { title: "Invia Save the Date", desc: "Opzione digitale consigliata" },
      en: { title: "Send Save the Date", desc: "Digital recommended" } },
    { key: "flowers", offset: -180,
      it: { title: "Fiori e allestimenti", desc: "Palette e concept definitivi" },
      en: { title: "Flowers & decor", desc: "Palette and final concept" } },
    { key: "stationery", offset: -150,
      it: { title: "Stationery", desc: "Libretti, segnaposto, tableau" },
      en: { title: "Stationery", desc: "Programs, place cards, seating plan" } },
    { key: "send-invitations", offset: -120,
      it: { title: "Invia inviti", desc: "Posta o digitale con RSVP" },
      en: { title: "Send invitations", desc: "Postal or digital with RSVP" } },
    { key: "transport", offset: -90,
      it: { title: "Trasporti", desc: "Auto sposi e navette ospiti" },
      en: { title: "Transport", desc: "Wedding car & shuttles" } },
    { key: "rings", offset: -60,
      it: { title: "Acquista fedi", desc: "Misure e incisioni" },
      en: { title: "Buy rings", desc: "Sizing and engravings" } },
    { key: "final-menu", offset: -30,
      it: { title: "Conferma menù", desc: "Torta e intolleranze finali" },
      en: { title: "Finalize menu", desc: "Cake and final allergies" } },
    { key: "seating-plan", offset: -21,
      it: { title: "Seating plan", desc: "Tavoli e segnaposto" },
      en: { title: "Seating plan", desc: "Tables and place cards" } },
    { key: "final-payments", offset: -7,
      it: { title: "Saldi finali", desc: "Verifica contratti e ricevute" },
      en: { title: "Final payments", desc: "Check contracts & receipts" } },
    { key: "wedding-day", offset: 0,
      it: { title: "Giorno del matrimonio", desc: "Godetevi la festa!" },
      en: { title: "Wedding day", desc: "Enjoy the day!" } },
    { key: "thank-you", offset: +14,
      it: { title: "Thank-you", desc: "Grazie e foto per gli ospiti" },
      en: { title: "Thank-you notes", desc: "Send thanks & photos" } },
  ];

  const { data: insertedTl } = await upsert(
    "event_timelines",
    tl.map((t, sort) => ({
      event_type_id: eventTypeId,
      key: t.key,
      sort,
      offset_days: t.offset,
    })),
    "event_type_id,key"
  );

  // translations
  for (const t of tl) {
    const row = insertedTl.find(r => r.key === t.key);
    if (!row) continue;
    await upsert("event_timeline_translations", [
      { timeline_id: row.id, locale: "it-IT", title: t.it.title, description: t.it.desc ?? null },
      { timeline_id: row.id, locale: "en-GB", title: t.en.title, description: t.en.desc ?? null },
    ], "timeline_id,locale");
  }

  console.log("Seed completato (Matrimonio IT/EN).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});









