import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE!;
if (!url || !key) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE");
}
const db = createClient(url, key);

// ---------- Helpers ----------
async function upsert<T>(table: string, rows: T[], conflict?: string) {
  if (!rows.length) return [];
  const { data, error } = await db.from(table).upsert(rows, conflict ? { onConflict: conflict } : undefined).select();
  if (error) throw error;
  return data!;
}

async function ensureLocales() {
  await upsert("i18n_locales", [
    { code: "it-IT", name: "Italiano", direction: "ltr" },
    { code: "en-GB", name: "English",  direction: "ltr" },
  ], "code");
}

async function ensureEventType(code: string, nameIT: string, nameEN: string) {
  const { data: et } = await db.from("event_types").upsert({ code }, { onConflict: "code" }).select("*").single();
  await upsert("event_type_translations", [
    { event_type_id: et!.id, locale: "it-IT", name: nameIT },
    { event_type_id: et!.id, locale: "en-GB", name: nameEN },
  ]);
  return et!.id;
}

type CatDef = { it: string; en: string; sub: { it: string; en: string }[] };
type TLDef  = { key: string; offset: number; it: { title: string; desc?: string }, en: { title: string; desc?: string } };

async function alreadySeeded(eventTypeId: string) {
  const { error } = await db.from("categories").select("id", { count: "exact", head: true }).eq("event_type_id", eventTypeId);
  if (error) throw error;
  const { data: d2, error: e2 } = await db.from("categories").select("id").eq("event_type_id", eventTypeId).limit(1);
  if (e2) throw e2;
  return (d2?.length ?? 0) > 0;
}

async function seedEvent(
  code: string,
  nameIT: string,
  nameEN: string,
  cats: CatDef[],
  tl: TLDef[]
) {
  const eventTypeId = await ensureEventType(code, nameIT, nameEN);

  if (await alreadySeeded(eventTypeId)) {
    console.log(`-> Skipping ${code}: categories already present.`);
    return;
  }

  // Insert categories
  const catRows = cats.map((_, i) => ({ event_type_id: eventTypeId, sort: i }));
  const insertedCats = await upsert("categories", catRows);

  // Category translations + subcategories
  for (let i = 0; i < cats.length; i++) {
    const catId = insertedCats[i].id;
    const c = cats[i];
    await upsert("category_translations", [
      { category_id: catId, locale: "it-IT", name: c.it },
      { category_id: catId, locale: "en-GB", name: c.en },
    ]);

    const subRows = c.sub.map((_, idx) => ({ category_id: catId, sort: idx }));
    const insertedSubs = await upsert("subcategories", subRows);

    for (let j = 0; j < c.sub.length; j++) {
      await upsert("subcategory_translations", [
        { subcategory_id: insertedSubs[j].id, locale: "it-IT", name: c.sub[j].it },
        { subcategory_id: insertedSubs[j].id, locale: "en-GB", name: c.sub[j].en },
      ]);
    }
  }

  // Timeline
  const tlRows = tl.map(t => ({ event_type_id: eventTypeId, key: t.key, offset_days: t.offset }));
  const insertedTl = await upsert("event_timelines", tlRows);

  for (let i = 0; i < tl.length; i++) {
    await upsert("event_timeline_translations", [
      { timeline_id: insertedTl[i].id, locale: "it-IT", title: tl[i].it.title, description: tl[i].it.desc ?? null },
      { timeline_id: insertedTl[i].id, locale: "en-GB", title: tl[i].en.title, description: tl[i].en.desc ?? null },
    ]);
  }

  console.log(`Seeded ${code} (${nameIT}/${nameEN})`);
}

// ---------- Definitions ----------
const DICIOTTESIMO_CATS: CatDef[] = [
  { it: "Location & Party", en: "Venue & Party", sub: [
    { it: "Affitto sala/location", en: "Venue rental" },
    { it: "Allestimento sala", en: "Room setup" },
    { it: "Guardaroba/sicurezza", en: "Cloakroom/Security" },
  ]},
  { it: "Cibo & Torta", en: "Food & Cake", sub: [
    { it: "Catering/Buffet", en: "Catering/Buffet" },
    { it: "Torta", en: "Cake" },
    { it: "Bevande/Open bar", en: "Drinks/Open bar" },
  ]},
  { it: "Musica & Intrattenimento", en: "Music & Entertainment", sub: [
    { it: "DJ/Band", en: "DJ/Band" },
    { it: "Animazione", en: "Entertainment" },
    { it: "Audio/Luci", en: "Audio/Lighting" },
  ]},
  { it: "Foto & Video", en: "Photo & Video", sub: [
    { it: "Fotografo", en: "Photographer" },
    { it: "Videomaker", en: "Videographer" },
    { it: "Photobooth", en: "Photobooth" },
  ]},
  { it: "Inviti & Digital", en: "Invitations & Digital", sub: [
    { it: "Inviti", en: "Invitations" },
    { it: "Sito/QR", en: "Website/QR" },
    { it: "Lista regali", en: "Gift list" },
  ]},
  { it: "Outfit & Beauty", en: "Outfit & Beauty", sub: [
    { it: "Abito", en: "Outfit" },
    { it: "Trucco/Parrucco", en: "Make-up/Hair" },
    { it: "Accessori", en: "Accessories" },
  ]},
];

const DICIOTTESIMO_TL: TLDef[] = [
  { key:"set-date", offset:-90, it:{title:"Scegli data e budget"}, en:{title:"Choose date & budget"} },
  { key:"book-venue", offset:-75, it:{title:"Prenota location"}, en:{title:"Book venue"} },
  { key:"dj-band", offset:-60, it:{title:"Ingaggia DJ/Band"}, en:{title:"Hire DJ/Band"} },
  { key:"invites", offset:-45, it:{title:"Invia inviti"}, en:{title:"Send invitations"} },
  { key:"catering", offset:-40, it:{title:"Conferma catering/torta"}, en:{title:"Confirm catering/cake"} },
  { key:"photo", offset:-35, it:{title:"Fotografo/Videomaker"}, en:{title:"Photo/Video"} },
  { key:"outfit", offset:-21, it:{title:"Outfit & beauty"}, en:{title:"Outfit & beauty"} },
  { key:"final", offset:-7, it:{title:"Conferme finali"}, en:{title:"Final confirmations"} },
  { key:"party", offset:0, it:{title:"Festa!"}, en:{title:"Party!"} },
];

const CRESIMA_CATS: CatDef[] = [
  { it:"Cerimonia", en:"Ceremony", sub:[
    { it:"Documenti/Parrocchia", en:"Documents/Parish" },
    { it:"Offerte", en:"Offerings" },
    { it:"Coro/Musica", en:"Choir/Music" },
  ]},
  { it:"Outfit", en:"Outfit", sub:[
    { it:"Abito cresimando/a", en:"Outfit" },
    { it:"Parrucchiere", en:"Hair" },
    { it:"Fiori spilla/Bracciale", en:"Boutonniere/Wrist corsage" },
  ]},
  { it:"Ricevimento", en:"Reception", sub:[
    { it:"Location", en:"Venue" },
    { it:"Catering", en:"Catering" },
    { it:"Torta/Dolci", en:"Cake/Sweets" },
  ]},
  { it:"Inviti & Bomboniere", en:"Invitations & Favors", sub:[
    { it:"Inviti", en:"Invitations" },
    { it:"Bomboniere", en:"Favors" },
    { it:"Ringraziamenti", en:"Thank-you notes" },
  ]},
  { it:"Foto & Video", en:"Photo & Video", sub:[
    { it:"Fotografo", en:"Photographer" },
    { it:"Album", en:"Album" },
  ]},
];

const CRESIMA_TL: TLDef[] = [
  { key:"parish", offset:-120, it:{title:"Contatta la parrocchia"}, en:{title:"Contact parish"} },
  { key:"documents", offset:-90, it:{title:"Documenti e padrino/madrina"}, en:{title:"Documents & sponsors"} },
  { key:"reception", offset:-60, it:{title:"Prenota location/ricevimento"}, en:{title:"Book venue/reception"} },
  { key:"invites", offset:-45, it:{title:"Invia inviti"}, en:{title:"Send invitations"} },
  { key:"outfit", offset:-30, it:{title:"Outfit cresima"}, en:{title:"Outfit"} },
  { key:"photo", offset:-21, it:{title:"Fotografo"}, en:{title:"Photographer"} },
  { key:"day", offset:0, it:{title:"Giorno della cresima"}, en:{title:"Confirmation day"} },
  { key:"thanks", offset:7, it:{title:"Ringraziamenti"}, en:{title:"Thank-you"} },
];

const LAUREA_CATS: CatDef[] = [
  { it:"Cerimonia", en:"Ceremony", sub:[
    { it:"Prenotazione/Biglietti", en:"Booking/Tickets" },
    { it:"Documenti/Segreteria", en:"Documents/Registry" },
  ]},
  { it:"Party", en:"Party", sub:[
    { it:"Location", en:"Venue" },
    { it:"Catering/Buffet", en:"Catering/Buffet" },
    { it:"Torta", en:"Cake" },
    { it:"Bevande", en:"Drinks" },
  ]},
  { it:"Foto & Video", en:"Photo & Video", sub:[
    { it:"Fotografo", en:"Photographer" },
    { it:"Videomaker", en:"Videographer" },
  ]},
  { it:"Inviti & Decor", en:"Invitations & Decor", sub:[
    { it:"Inviti", en:"Invitations" },
    { it:"Allestimenti", en:"Decor" },
    { it:"Coriandoli/Ghirlande", en:"Confetti/Garlands" },
  ]},
  { it:"Outfit & Accessori", en:"Outfit & Accessories", sub:[
    { it:"Outfit", en:"Outfit" },
    { it:"Corona alloro", en:"Laurel crown" },
    { it:"Parrucchiere/Make-up", en:"Hair/Make-up" },
  ]},
];

const LAUREA_TL: TLDef[] = [
  { key:"date", offset:-60, it:{title:"Conferma data sessione"}, en:{title:"Confirm session date"} },
  { key:"venue", offset:-45, it:{title:"Prenota venue party"}, en:{title:"Book party venue"} },
  { key:"invites", offset:-30, it:{title:"Invia inviti"}, en:{title:"Send invitations"} },
  { key:"photo", offset:-21, it:{title:"Fotografo"}, en:{title:"Photographer"} },
  { key:"outfit", offset:-14, it:{title:"Outfit & accessori"}, en:{title:"Outfit & accessories"} },
  { key:"party", offset:0, it:{title:"Cerimonia & Festa"}, en:{title:"Ceremony & Party"} },
];

const COMUNIONE_CATS: CatDef[] = [
  { it:"Cerimonia", en:"Ceremony", sub:[
    { it:"Catechismo/Documenti", en:"Catechism/Documents" },
    { it:"Offerte", en:"Offerings" },
    { it:"Coro/Musica", en:"Choir/Music" },
  ]},
  { it:"Outfit Bambino/a", en:"Child Outfit", sub:[
    { it:"Abito", en:"Outfit" },
    { it:"Scarpe/Accessori", en:"Shoes/Accessories" },
    { it:"Parrucchiere", en:"Hair" },
  ]},
  { it:"Ricevimento", en:"Reception", sub:[
    { it:"Location", en:"Venue" },
    { it:"Catering", en:"Catering" },
    { it:"Torta/Dolci", en:"Cake/Sweets" },
  ]},
  { it:"Inviti & Bomboniere", en:"Invitations & Favors", sub:[
    { it:"Inviti", en:"Invitations" },
    { it:"Bomboniere", en:"Favors" },
    { it:"Ringraziamenti", en:"Thank-you notes" },
  ]},
  { it:"Foto & Video", en:"Photo & Video", sub:[
    { it:"Fotografo", en:"Photographer" },
    { it:"Album", en:"Album" },
  ]},
];

const COMUNIONE_TL: TLDef[] = [
  { key:"parish", offset:-150, it:{title:"Contatta la parrocchia"}, en:{title:"Contact parish"} },
  { key:"catechism", offset:-120, it:{title:"Catechismo & documenti"}, en:{title:"Catechism & documents"} },
  { key:"reception", offset:-60, it:{title:"Prenota ricevimento"}, en:{title:"Book reception"} },
  { key:"invites", offset:-45, it:{title:"Invia inviti"}, en:{title:"Send invitations"} },
  { key:"photo", offset:-21, it:{title:"Fotografo"}, en:{title:"Photographer"} },
  { key:"day", offset:0, it:{title:"Giorno della Comunione"}, en:{title:"Communion day"} },
  { key:"thanks", offset:7, it:{title:"Ringraziamenti"}, en:{title:"Thank-you"} },
];

const ANNIVERSARIO_CATS: CatDef[] = [
  { it:"Tipo & Location", en:"Type & Venue", sub:[
    { it:"Intimo o festa", en:"Intimate or party" },
    { it:"Location", en:"Venue" },
    { it:"Catering", en:"Catering" },
  ]},
  { it:"Musica & Intrattenimento", en:"Music & Entertainment", sub:[
    { it:"DJ/Band", en:"DJ/Band" },
    { it:"Playlist/Impianto", en:"Playlist/PA" },
  ]},
  { it:"Foto & Video", en:"Photo & Video", sub:[
    { it:"Fotografo", en:"Photographer" },
    { it:"Backdrop", en:"Backdrop" },
  ]},
  { it:"Inviti & Decor", en:"Invitations & Decor", sub:[
    { it:"Inviti", en:"Invitations" },
    { it:"Allestimenti", en:"Decor" },
    { it:"Torta", en:"Cake" },
  ]},
  { it:"Regali", en:"Gifts", sub:[
    { it:"Idea regalo partner", en:"Gift for partner" },
    { it:"Fiori", en:"Flowers" },
  ]},
];

const ANNIVERSARIO_TL: TLDef[] = [
  { key:"define", offset:-60, it:{title:"Definisci tipo di evento"}, en:{title:"Define event type"} },
  { key:"venue", offset:-45, it:{title:"Prenota location"}, en:{title:"Book venue"} },
  { key:"invites", offset:-30, it:{title:"Invia inviti"}, en:{title:"Send invitations"} },
  { key:"music", offset:-21, it:{title:"Musica/Intrattenimento"}, en:{title:"Music/Entertainment"} },
  { key:"decor", offset:-14, it:{title:"Decor & torta"}, en:{title:"Decor & cake"} },
  { key:"day", offset:0, it:{title:"Giorno dell’anniversario"}, en:{title:"Anniversary day"} },
];

const BABYSHOWER_CATS: CatDef[] = [
  { it:"Tema & Ospiti", en:"Theme & Guests", sub:[
    { it:"Tema", en:"Theme" },
    { it:"Lista invitati", en:"Guest list" },
  ]},
  { it:"Location & Cibo", en:"Venue & Food", sub:[
    { it:"Casa/Location", en:"Home/Venue" },
    { it:"Dolci/Merenda", en:"Sweets/Snacks" },
    { it:"Bevande", en:"Drinks" },
  ]},
  { it:"Giochi & Intrattenimento", en:"Games & Entertainment", sub:[
    { it:"Giochi a tema", en:"Theme games" },
    { it:"Premi", en:"Prizes" },
  ]},
  { it:"Foto & Decor", en:"Photo & Decor", sub:[
    { it:"Backdrop/Allestimento", en:"Backdrop/Decor" },
    { it:"Fotografo", en:"Photographer" },
  ]},
  { it:"Inviti & Regali", en:"Invitations & Gifts", sub:[
    { it:"Inviti", en:"Invitations" },
    { it:"Lista regali", en:"Gift registry" },
    { it:"Bomboniere", en:"Favors" },
  ]},
];

const BABYSHOWER_TL: TLDef[] = [
  { key:"theme", offset:-60, it:{title:"Scegli tema e data"}, en:{title:"Choose theme & date"} },
  { key:"venue", offset:-45, it:{title:"Decidi casa/location"}, en:{title:"Choose home/venue"} },
  { key:"invites", offset:-30, it:{title:"Invia inviti"}, en:{title:"Send invitations"} },
  { key:"games", offset:-21, it:{title:"Prepara giochi e premi"}, en:{title:"Prepare games & prizes"} },
  { key:"decor", offset:-14, it:{title:"Allestimenti & dolci"}, en:{title:"Decor & sweets"} },
  { key:"day", offset:0, it:{title:"Baby Shower"}, en:{title:"Baby Shower"} },
];

const GENDERREVEAL_CATS: CatDef[] = [
  { it:"Medico & Segreto", en:"Doctor & Secret", sub:[
    { it:"Busta/Esito", en:"Envelope/Result" },
    { it:"Custode del segreto", en:"Keeper of secret" },
  ]},
  { it:"Location & Reveal", en:"Venue & Reveal", sub:[
    { it:"Location", en:"Venue" },
    { it:"Metodo reveal (palloncino, torta…)", en:"Reveal method (balloon, cake…)" },
  ]},
  { it:"Foto & Video", en:"Photo & Video", sub:[
    { it:"Fotografo/Videomaker", en:"Photo/Video" },
  ]},
  { it:"Inviti & Snack", en:"Invitations & Snacks", sub:[
    { it:"Inviti", en:"Invitations" },
    { it:"Snack/Bevande", en:"Snacks/Drinks" },
  ]},
  { it:"Decor", en:"Decor", sub:[
    { it:"Allestimenti", en:"Decor" },
  ]},
];

const GENDERREVEAL_TL: TLDef[] = [
  { key:"doctor", offset:-45, it:{title:"Ritira esito dal medico"}, en:{title:"Get result from doctor"} },
  { key:"keeper", offset:-44, it:{title:"Nomina custode del segreto"}, en:{title:"Choose secret keeper"} },
  { key:"venue", offset:-30, it:{title:"Prenota location"}, en:{title:"Book venue"} },
  { key:"method", offset:-21, it:{title:"Scegli metodo reveal"}, en:{title:"Choose reveal method"} },
  { key:"invites", offset:-14, it:{title:"Invia inviti"}, en:{title:"Send invitations"} },
  { key:"day", offset:0, it:{title:"Reveal!"}, en:{title:"Reveal!"} },
];

const FIDANZAMENTO_CATS: CatDef[] = [
  { it:"Luogo & Cena", en:"Venue & Dinner", sub:[
    { it:"Ristorante/Casa", en:"Restaurant/Home" },
    { it:"Menù", en:"Menu" },
  ]},
  { it:"Ospiti & Inviti", en:"Guests & Invitations", sub:[
    { it:"Lista invitati", en:"Guest list" },
    { it:"Inviti", en:"Invitations" },
  ]},
  { it:"Foto & Musica", en:"Photo & Music", sub:[
    { it:"Fotografo", en:"Photographer" },
    { it:"Musica di sottofondo", en:"Background music" },
  ]},
  { it:"Decor & Fiori", en:"Decor & Flowers", sub:[
    { it:"Allestimenti", en:"Decor" },
    { it:"Fiori", en:"Flowers" },
  ]},
  { it:"Regali", en:"Gifts", sub:[
    { it:"Per partner", en:"For partner" },
    { it:"Per genitori", en:"For parents" },
  ]},
];

const FIDANZAMENTO_TL: TLDef[] = [
  { key:"define", offset:-45, it:{title:"Definisci luogo e budget"}, en:{title:"Define venue & budget"} },
  { key:"book", offset:-30, it:{title:"Prenota ristorante/casa"}, en:{title:"Book restaurant/home"} },
  { key:"invites", offset:-21, it:{title:"Invia inviti"}, en:{title:"Send invitations"} },
  { key:"photo", offset:-14, it:{title:"Fotografo opzionale"}, en:{title:"Optional photographer"} },
  { key:"day", offset:0, it:{title:"Festa di fidanzamento"}, en:{title:"Engagement party"} },
];

const PROPOSAL_CATS: CatDef[] = [
  { it:"Anello & Sicurezza", en:"Ring & Safety", sub:[
    { it:"Acquisto anello", en:"Buy ring" },
    { it:"Assicurazione", en:"Insurance" },
  ]},
  { it:"Location & Permessi", en:"Location & Permits", sub:[
    { it:"Sopralluogo", en:"Scouting" },
    { it:"Permessi", en:"Permits" },
  ]},
  { it:"Foto & Setup", en:"Photo & Setup", sub:[
    { it:"Fotografo nascosto", en:"Hidden photographer" },
    { it:"Allestimento sorpresa", en:"Surprise setup" },
  ]},
  { it:"Cena & Logistica", en:"Dinner & Logistics", sub:[
    { it:"Ristorante", en:"Restaurant" },
    { it:"Trasporti", en:"Transport" },
  ]},
];

const PROPOSAL_TL: TLDef[] = [
  { key:"ring", offset:-60, it:{title:"Acquista anello"}, en:{title:"Buy ring"} },
  { key:"scout", offset:-45, it:{title:"Sopralluogo location"}, en:{title:"Scout location"} },
  { key:"permits", offset:-30, it:{title:"Permessi e privacy"}, en:{title:"Permits & privacy"} },
  { key:"photo", offset:-21, it:{title:"Ingaggia fotografo nascosto"}, en:{title:"Hire hidden photographer"} },
  { key:"setup", offset:-7,  it:{title:"Prepara allestimento sorpresa"}, en:{title:"Prepare surprise setup"} },
  { key:"day",  offset:0,   it:{title:"Proposta!"}, en:{title:"Proposal!"} },
];

// ---------- Runner ----------
async function main() {
  await ensureLocales();

  await seedEvent("EIGHTEENTH", "Diciottesimo", "18th Birthday", DICIOTTESIMO_CATS, DICIOTTESIMO_TL);
  await seedEvent("CONFIRMATION", "Cresima", "Confirmation", CRESIMA_CATS, CRESIMA_TL);
  await seedEvent("GRADUATION", "Laurea", "Graduation", LAUREA_CATS, LAUREA_TL);
  await seedEvent("COMMUNION", "Comunione", "Communion", COMUNIONE_CATS, COMUNIONE_TL);
  await seedEvent("ANNIVERSARY", "Anniversario di matrimonio", "Wedding Anniversary", ANNIVERSARIO_CATS, ANNIVERSARIO_TL);
  await seedEvent("BABY_SHOWER", "Baby Shower", "Baby Shower", BABYSHOWER_CATS, BABYSHOWER_TL);
  await seedEvent("GENDER_REVEAL", "Gender Reveal", "Gender Reveal", GENDERREVEAL_CATS, GENDERREVEAL_TL);
  await seedEvent("ENGAGEMENT", "Festa di fidanzamento", "Engagement Party", FIDANZAMENTO_CATS, FIDANZAMENTO_TL);
  await seedEvent("PROPOSAL", "Festa proposta (Proposal)", "Proposal", PROPOSAL_CATS, PROPOSAL_TL);

  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
