#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

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

const locales = [
  { code: "it-IT", name: "Italiano (Italia)", direction: "ltr" },
  { code: "en-GB", name: "English (UK)", direction: "ltr" },
  { code: "es-ES", name: "Español (España)", direction: "ltr" },
  { code: "fr-FR", name: "Français", direction: "ltr" },
  { code: "de-DE", name: "Deutsch", direction: "ltr" },
  { code: "ar", name: "العربية", direction: "rtl" },
  { code: "ja-JP", name: "日本語", direction: "ltr" },
  { code: "zh-CN", name: "简体中文", direction: "ltr" },
  { code: "hi-IN", name: "हिन्दी (भारत)", direction: "ltr" },
];

const countries = [
  { code: "IT", name: "Italia", default_locale: "it-IT" },
  { code: "MX", name: "México", default_locale: "es-ES" },
  { code: "JP", name: "日本", default_locale: "ja-JP" },
  { code: "US", name: "United States", default_locale: "en-GB" },
  { code: "FR", name: "France", default_locale: "fr-FR" },
  { code: "DE", name: "Deutschland", default_locale: "de-DE" },
  { code: "ES", name: "España", default_locale: "es-ES" },
  { code: "GB", name: "United Kingdom", default_locale: "en-GB" },
  { code: "CN", name: "中国", default_locale: "zh-CN" },
  { code: "IN", name: "India", default_locale: "hi-IN" },
];

const eventDefinitions = [
  {
    code: "WEDDING",
    translations: {
      "it-IT": {
        name: "Matrimonio",
        description: "Budget, timeline e fornitori per organizzare il matrimonio perfetto",
      },
      "en-GB": {
        name: "Wedding",
        description: "Plan venues, suppliers and a smart budget for your wedding",
      },
    },
    categories: [
      {
        code: "venue-catering",
        sort: 10,
        translations: {
          "it-IT": "Location & Catering",
          "en-GB": "Venue & Catering",
        },
        subcategories: [
          { code: "venue-rental", sort: 10, translations: { "it-IT": "Affitto location", "en-GB": "Venue rental" } },
          { code: "catering-food", sort: 20, translations: { "it-IT": "Catering (cibo)", "en-GB": "Catering (food)" } },
          { code: "wedding-cake", sort: 30, translations: { "it-IT": "Torta nuziale", "en-GB": "Wedding cake" } },
          { code: "open-bar", sort: 40, translations: { "it-IT": "Open bar", "en-GB": "Open bar" } },
          { code: "service-staff", sort: 50, translations: { "it-IT": "Servizio sala", "en-GB": "Service staff" } },
        ],
      },
      {
        code: "ceremony",
        sort: 20,
        translations: {
          "it-IT": "Cerimonia",
          "en-GB": "Ceremony",
        },
        subcategories: [
          { code: "church-or-hall", sort: 10, translations: { "it-IT": "Chiesa/Comune", "en-GB": "Church or Town hall" } },
          { code: "ceremony-music", sort: 20, translations: { "it-IT": "Musica cerimonia", "en-GB": "Ceremony music" } },
          { code: "flowers-aisle", sort: 30, translations: { "it-IT": "Fiori navata", "en-GB": "Aisle florals" } },
        ],
      },
      {
        code: "photo-video",
        sort: 30,
        translations: {
          "it-IT": "Foto & Video",
          "en-GB": "Photo & Video",
        },
        subcategories: [
          { code: "photographer", sort: 10, translations: { "it-IT": "Fotografo", "en-GB": "Photographer" } },
          { code: "videomaker", sort: 20, translations: { "it-IT": "Videomaker", "en-GB": "Videographer" } },
          { code: "album", sort: 30, translations: { "it-IT": "Album fotografico", "en-GB": "Photo album" } },
        ],
      },
      {
        code: "attire",
        sort: 40,
        translations: {
          "it-IT": "Abbigliamento",
          "en-GB": "Attire",
        },
        subcategories: [
          { code: "bride-dress", sort: 10, translations: { "it-IT": "Abito sposa", "en-GB": "Bride dress" } },
          { code: "groom-suit", sort: 20, translations: { "it-IT": "Abito sposo", "en-GB": "Groom suit" } },
          { code: "beauty", sort: 30, translations: { "it-IT": "Hair & Make-up", "en-GB": "Hair & Make-up" } },
        ],
      },
      {
        code: "entertainment",
        sort: 50,
        translations: {
          "it-IT": "Intrattenimento",
          "en-GB": "Entertainment",
        },
        subcategories: [
          { code: "band", sort: 10, translations: { "it-IT": "Band / DJ", "en-GB": "Band / DJ" } },
          { code: "kids-activities", sort: 20, translations: { "it-IT": "Animazione bambini", "en-GB": "Kids entertainment" } },
          { code: "photo-booth", sort: 30, translations: { "it-IT": "Photobooth", "en-GB": "Photo booth" } },
        ],
      },
    ],
    timeline: [
      {
        key: "book-venue",
        offsetDays: -365,
        sort: 10,
        translations: {
          "it-IT": {
            title: "Prenota la location",
            description: "Blocca location e catering con largo anticipo, soprattutto in alta stagione.",
          },
          "en-GB": {
            title: "Book the venue",
            description: "Secure venue and catering early, popular dates go fast.",
          },
        },
      },
      {
        key: "secure-suppliers",
        offsetDays: -300,
        sort: 20,
        translations: {
          "it-IT": {
            title: "Blocca i fornitori principali",
            description: "Fotografo, musica e fiorista richiedono anticipo per garantire disponibilità.",
          },
          "en-GB": {
            title: "Confirm main suppliers",
            description: "Photographer, entertainment and floral designer often book months ahead.",
          },
        },
      },
      {
        key: "send-invitations",
        offsetDays: -120,
        sort: 30,
        translations: {
          "it-IT": {
            title: "Invia le partecipazioni",
            description: "Include RSVP e informazioni logistiche per gli invitati.",
          },
          "en-GB": {
            title: "Send invitations",
            description: "Share RSVP details and travel tips for your guests.",
          },
        },
      },
      {
        key: "final-meeting",
        offsetDays: -14,
        sort: 40,
        translations: {
          "it-IT": {
            title: "Riunione finale con i fornitori",
            description: "Conferma orari, playlist e piano B in caso di pioggia.",
          },
          "en-GB": {
            title: "Final supplier briefing",
            description: "Confirm timings, playlists and contingency plans.",
          },
        },
      },
      {
        key: "wedding-day",
        offsetDays: 0,
        sort: 50,
        translations: {
          "it-IT": { title: "Giorno del matrimonio", description: "Goditi la giornata!" },
          "en-GB": { title: "Wedding day", description: "Enjoy every moment!" },
        },
      },
    ],
  },
  {
    code: "BAPTISM",
    translations: {
      "it-IT": {
        name: "Battesimo",
        description: "Checklist, budget e tradizioni per il battesimo",
      },
      "en-GB": {
        name: "Baptism",
        description: "Plan godparents, ceremony and reception for a baptism",
      },
    },
    categories: [
      {
        code: "ceremony",
        sort: 10,
        translations: {
          "it-IT": "Cerimonia",
          "en-GB": "Ceremony",
        },
        subcategories: [
          { code: "church-fees", sort: 10, translations: { "it-IT": "Offerta chiesa", "en-GB": "Church offering" } },
          { code: "documents", sort: 20, translations: { "it-IT": "Documenti", "en-GB": "Documents" } },
        ],
      },
      {
        code: "reception",
        sort: 20,
        translations: {
          "it-IT": "Ricevimento",
          "en-GB": "Reception",
        },
        subcategories: [
          { code: "lunch", sort: 10, translations: { "it-IT": "Pranzo", "en-GB": "Lunch" } },
          { code: "cake", sort: 20, translations: { "it-IT": "Torta", "en-GB": "Cake" } },
        ],
      },
    ],
    timeline: [
      {
        key: "choose-date",
        offsetDays: -90,
        sort: 10,
        translations: {
          "it-IT": { title: "Scegli la data", description: "Verifica disponibilità chiesa e padrini." },
          "en-GB": { title: "Choose the date", description: "Confirm church availability and godparents." },
        },
      },
      {
        key: "confirm-ceremony",
        offsetDays: -30,
        sort: 20,
        translations: {
          "it-IT": { title: "Conferma la cerimonia", description: "Invia i documenti richiesti alla parrocchia." },
          "en-GB": { title: "Confirm ceremony", description: "Submit the required paperwork to the parish." },
        },
      },
      {
        key: "celebration-day",
        offsetDays: 0,
        sort: 30,
        translations: {
          "it-IT": { title: "Giorno della festa", description: "Arriva con anticipo per coordinarti con padrini e fotografo." },
          "en-GB": { title: "Celebration day", description: "Arrive early and brief godparents and photographer." },
        },
      },
    ],
  },
  {
    code: "GRADUATION",
    translations: {
      "it-IT": {
        name: "Laurea",
        description: "Organizza festa, bomboniere e regali per la laurea",
      },
      "en-GB": {
        name: "Graduation",
        description: "Celebrate graduation with timeline, venue and favours",
      },
    },
    categories: [
      {
        code: "party",
        sort: 10,
        translations: {
          "it-IT": "Festa",
          "en-GB": "Party",
        },
        subcategories: [
          { code: "venue", sort: 10, translations: { "it-IT": "Location", "en-GB": "Venue" } },
          { code: "buffet", sort: 20, translations: { "it-IT": "Buffet", "en-GB": "Buffet" } },
        ],
      },
      {
        code: "gifts",
        sort: 20,
        translations: {
          "it-IT": "Regali",
          "en-GB": "Gifts",
        },
        subcategories: [
          { code: "bomboniere", sort: 10, translations: { "it-IT": "Bomboniere", "en-GB": "Favours" } },
          { code: "flowers", sort: 20, translations: { "it-IT": "Fiori", "en-GB": "Flowers" } },
        ],
      },
    ],
    timeline: [
      {
        key: "book-location",
        offsetDays: -45,
        sort: 10,
        translations: {
          "it-IT": { title: "Prenota la location", description: "Scegli un locale adatto al numero di invitati." },
          "en-GB": { title: "Book the venue", description: "Pick a venue that matches your guest count." },
        },
      },
      {
        key: "order-favours",
        offsetDays: -20,
        sort: 20,
        translations: {
          "it-IT": { title: "Ordina le bomboniere", description: "Personalizza i dettagli nei colori del corso." },
          "en-GB": { title: "Order favours", description: "Personalise keepsakes in your faculty colours." },
        },
      },
      {
        key: "celebration",
        offsetDays: 0,
        sort: 30,
        translations: {
          "it-IT": { title: "Giorno della festa", description: "Coordina consegna tesi e brindisi con gli invitati." },
          "en-GB": { title: "Celebration day", description: "Schedule thesis delivery and toast with guests." },
        },
      },
    ],
  },
];

const eventTypeVariants = [
  {
    eventTypeCode: "WEDDING",
    countryCode: "MX",
    overrides: {
      timeline: {
        adjust: {
          "book-venue": -450,
          "send-invitations": -150,
        },
        add: [
          {
            key: "plan-civil-ceremony",
            offsetDays: -210,
            translations: {
              "es-ES": {
                title: "Tramitar ceremonia civil",
                description: "Reserva el registro civil y prepara la documentación requerida.",
              },
              "en-GB": {
                title: "Arrange civil ceremony paperwork",
                description: "Book the civil registry slot and gather documents in advance.",
              },
            },
          },
        ],
      },
      categories: {
        rename: {
          "venue-catering": {
            "es-ES": "Recepción y Banquete",
          },
        },
        add: [
          {
            code: "serenata",
            sort: 65,
            translations: {
              "es-ES": "Serenata & Mariachi",
              "en-GB": "Serenade & Mariachi",
            },
            subcategories: [
              {
                code: "mariachi-band",
                sort: 10,
                translations: {
                  "es-ES": "Contratar mariachi",
                  "en-GB": "Hire mariachi band",
                },
              },
              {
                code: "serenade-planning",
                sort: 20,
                translations: {
                  "es-ES": "Planificar serenata",
                  "en-GB": "Plan serenade surprise",
                },
              },
            ],
          },
        ],
      },
    },
  },
  {
    eventTypeCode: "WEDDING",
    countryCode: "JP",
    overrides: {
      timeline: {
        adjust: {
          "book-venue": -300,
        },
        add: [
          {
            key: "kimono-fitting",
            offsetDays: -90,
            translations: {
              "ja-JP": {
                title: "衣装合わせ (和装)",
                description: "白無垢・色打掛など伝統衣装の採寸と予約を行います。",
              },
              "en-GB": {
                title: "Kimono fitting",
                description: "Schedule fittings for shiromuku or iro-uchikake traditional outfits.",
              },
            },
          },
          {
            key: "shinto-ritual",
            offsetDays: -60,
            translations: {
              "ja-JP": {
                title: "神前式の準備",
                description: "神社との打ち合わせと玉串料の確認を行います。",
              },
              "en-GB": {
                title: "Plan Shinto ceremony",
                description: "Meet the shrine coordinator and confirm offerings for the ritual.",
              },
            },
          },
        ],
      },
      categories: {
        add: [
          {
            code: "traditional-rituals",
            sort: 70,
            translations: {
              "ja-JP": "伝統儀式",
              "en-GB": "Traditional rituals",
            },
            subcategories: [
              {
                code: "sake-ceremony",
                sort: 10,
                translations: {
                  "ja-JP": "三献の儀", 
                  "en-GB": "San-san-kudo sake ritual",
                },
              },
              {
                code: "shrine-offerings",
                sort: 20,
                translations: {
                  "ja-JP": "玉串料",
                  "en-GB": "Shrine offerings",
                },
              },
            ],
          },
        ],
      },
    },
  },
];

function table(name) {
  return `app_i18n.${name}`;
}

async function upsert(name, rows, options = {}) {
  if (!rows.length) return;
  const { error } = await supabase.from(table(name)).upsert(rows, options);
  if (error) {
    throw new Error(`Errore upsert ${name}: ${error.message}`);
  }
}

async function select(name, columns, filters = (q) => q) {
  const query = supabase.from(table(name)).select(columns);
  const { data, error } = await filters(query);
  if (error) {
    throw new Error(`Errore select ${name}: ${error.message}`);
  }
  return data;
}

async function main() {
  console.log("➡️  Seeding app_i18n.locales...");
  await upsert("locales", locales, { onConflict: "code" });

  console.log("➡️  Seeding app_i18n.countries...");
  await upsert("countries", countries, { onConflict: "code" });

  console.log("➡️  Seeding app_i18n.event_types...");
  await upsert(
    "event_types",
    eventDefinitions.map((event) => ({ code: event.code })),
    { onConflict: "code" }
  );

  const eventTypeRows = await select("event_types", "id, code", (q) =>
    q.in(
      "code",
      eventDefinitions.map((event) => event.code)
    )
  );
  const eventIdByCode = new Map(eventTypeRows.map((row) => [row.code, row.id]));
  const eventCodeById = new Map(eventTypeRows.map((row) => [row.id, row.code]));

  console.log("➡️  Seeding app_i18n.event_type_translations...");
  const eventTypeTranslationRows = [];
  for (const event of eventDefinitions) {
    const eventTypeId = eventIdByCode.get(event.code);
    if (!eventTypeId) continue;
    for (const [locale, payload] of Object.entries(event.translations)) {
      eventTypeTranslationRows.push({
        event_type_id: eventTypeId,
        locale,
        name: payload.name,
        description: payload.description ?? null,
      });
    }
  }
  await upsert("event_type_translations", eventTypeTranslationRows, {
    onConflict: "event_type_id,locale",
  });

  console.log("➡️  Seeding app_i18n.categories...");
  const categoryRows = [];
  const categoryDefs = new Map();
  for (const event of eventDefinitions) {
    const eventTypeId = eventIdByCode.get(event.code);
    if (!eventTypeId) continue;
    for (const category of event.categories) {
      categoryRows.push({
        event_type_id: eventTypeId,
        code: category.code,
        sort: category.sort ?? 0,
      });
      categoryDefs.set(`${event.code}:${category.code}`, {
        translations: category.translations,
        subcategories: category.subcategories ?? [],
      });
    }
  }
  await upsert("categories", categoryRows, { onConflict: "event_type_id,code" });

  const categoryRecords = await select(
    "categories",
    "id, event_type_id, code",
    (q) => q.in("event_type_id", Array.from(eventIdByCode.values()))
  );
  const categoryIdByKey = new Map();
  const categoryKeyById = new Map();
  for (const row of categoryRecords) {
    const eventCode = eventCodeById.get(row.event_type_id);
    if (!eventCode) continue;
    const key = `${eventCode}:${row.code}`;
    categoryIdByKey.set(key, row.id);
    categoryKeyById.set(row.id, key);
  }

  console.log("➡️  Seeding app_i18n.category_translations...");
  const categoryTranslationRows = [];
  for (const [key, def] of categoryDefs.entries()) {
    const categoryId = categoryIdByKey.get(key);
    if (!categoryId) continue;
    for (const [locale, name] of Object.entries(def.translations)) {
      categoryTranslationRows.push({ category_id: categoryId, locale, name });
    }
  }
  await upsert("category_translations", categoryTranslationRows, {
    onConflict: "category_id,locale",
  });

  console.log("➡️  Seeding app_i18n.subcategories...");
  const subcategoryRows = [];
  const subcategoryDefs = new Map();
  for (const [key, def] of categoryDefs.entries()) {
    const categoryId = categoryIdByKey.get(key);
    if (!categoryId) continue;
    for (const sub of def.subcategories) {
      subcategoryRows.push({
        category_id: categoryId,
        code: sub.code,
        sort: sub.sort ?? 0,
      });
      subcategoryDefs.set(`${key}:${sub.code}`, sub.translations ?? {});
    }
  }
  await upsert("subcategories", subcategoryRows, { onConflict: "category_id,code" });

  const subcategoryRecords = await select(
    "subcategories",
    "id, category_id, code",
    (q) => q.in("category_id", Array.from(categoryIdByKey.values()))
  );
  const subcategoryIdByKey = new Map();
  for (const row of subcategoryRecords) {
    const categoryKey = categoryKeyById.get(row.category_id);
    if (!categoryKey) continue;
    subcategoryIdByKey.set(`${categoryKey}:${row.code}`, row.id);
  }

  console.log("➡️  Seeding app_i18n.subcategory_translations...");
  const subcategoryTranslationRows = [];
  for (const [key, translations] of subcategoryDefs.entries()) {
    const subcategoryId = subcategoryIdByKey.get(key);
    if (!subcategoryId) continue;
    for (const [locale, name] of Object.entries(translations)) {
      subcategoryTranslationRows.push({
        subcategory_id: subcategoryId,
        locale,
        name,
      });
    }
  }
  await upsert("subcategory_translations", subcategoryTranslationRows, {
    onConflict: "subcategory_id,locale",
  });

  console.log("➡️  Seeding app_i18n.event_timelines...");
  const timelineRows = [];
  const timelineDefs = new Map();
  for (const event of eventDefinitions) {
    const eventTypeId = eventIdByCode.get(event.code);
    if (!eventTypeId) continue;
    for (const entry of event.timeline) {
      timelineRows.push({
        event_type_id: eventTypeId,
        key: entry.key,
        offset_days: entry.offsetDays,
        sort: entry.sort ?? 0,
      });
      timelineDefs.set(`${event.code}:${entry.key}`, entry.translations ?? {});
    }
  }
  await upsert("event_timelines", timelineRows, { onConflict: "event_type_id,key" });

  const timelineRecords = await select(
    "event_timelines",
    "id, event_type_id, key",
    (q) => q.in("event_type_id", Array.from(eventIdByCode.values()))
  );
  const timelineIdByKey = new Map();
  for (const row of timelineRecords) {
    const eventCode = eventCodeById.get(row.event_type_id);
    if (!eventCode) continue;
    timelineIdByKey.set(`${eventCode}:${row.key}`, row.id);
  }

  console.log("➡️  Seeding app_i18n.event_timeline_translations...");
  const timelineTranslationRows = [];
  for (const [key, translations] of timelineDefs.entries()) {
    const timelineId = timelineIdByKey.get(key);
    if (!timelineId) continue;
    for (const [locale, payload] of Object.entries(translations)) {
      timelineTranslationRows.push({
        timeline_id: timelineId,
        locale,
        title: payload.title,
        description: payload.description ?? null,
      });
    }
  }
  await upsert("event_timeline_translations", timelineTranslationRows, {
    onConflict: "timeline_id,locale",
  });

  console.log("➡️  Seeding app_i18n.event_type_variants...");
  const variantRows = [];
  for (const variant of eventTypeVariants) {
    const eventTypeId = eventIdByCode.get(variant.eventTypeCode);
    if (!eventTypeId) continue;
    variantRows.push({
      event_type_id: eventTypeId,
      country_code: variant.countryCode,
      overrides: variant.overrides,
    });
  }
  await upsert("event_type_variants", variantRows, {
    onConflict: "event_type_id,country_code",
  });

  console.log("✅ Seed i18n completato.");
}

main().catch((err) => {
  console.error("❌ Seed fallito:", err);
  process.exit(1);
});
