// Seed i18n diretto per PostgreSQL locale (senza Supabase REST API)
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { Client } = pg;

async function main() {
  const connectionString = process.env.SUPABASE_DB_URL || 'postgres://postgres:postgres@localhost:5433/ibds';
  const client = new Client({ connectionString });

  console.log('🔌 Connessione a:', connectionString);
  await client.connect();
  console.log('✅ Connesso!\n');

  try {
    // 1) Locales + Countries
    console.log('📍 Seeding i18n_locales...');
    await client.query(`
      INSERT INTO i18n_locales (code, name, direction)
      VALUES
        ('it-IT', 'Italiano', 'ltr'),
        ('en-GB', 'English', 'ltr'),
        ('es-ES', 'Español', 'ltr'),
        ('ja-JP', '日本語', 'ltr')
      ON CONFLICT (code) DO NOTHING;
    `);
    console.log('   ✅ Locales: it-IT, en-GB, es-ES, ja-JP\n');

    console.log('🌍 Seeding geo_countries...');
    await client.query(`
      INSERT INTO geo_countries (code, default_locale)
      VALUES
        ('IT', 'it-IT'),
        ('MX', 'es-ES'),
        ('GB', 'en-GB'),
        ('US', 'en-GB'),
        ('JP', 'ja-JP')
      ON CONFLICT (code) DO NOTHING;
    `);
    console.log('   ✅ Countries: IT, MX, GB, US, JP\n');

    // 2) Event type: WEDDING
    console.log('💍 Seeding event_types (WEDDING)...');
    const etResult = await client.query(`
      INSERT INTO event_types (code, name, locale)
      VALUES ('WEDDING', 'Matrimonio', 'it-IT')
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    const eventTypeId = etResult.rows[0].id;
    console.log(`   ✅ Event type WEDDING created (ID: ${eventTypeId})\n`);

    console.log('🌐 Seeding event_type_translations...');
    await client.query(`
      INSERT INTO event_type_translations (event_type_id, locale, name)
      VALUES
        ($1, 'it-IT', 'Matrimonio'),
        ($1, 'en-GB', 'Wedding')
      ON CONFLICT (event_type_id, locale) DO UPDATE SET name = EXCLUDED.name;
    `, [eventTypeId]);
    console.log('   ✅ Traduzioni IT/EN aggiunte\n');

    // 3) Categories + Subcategories
    const cats = [
      {
        name_it: "Location & Catering", name_en: "Venue & Catering",
        sub: [
          { it: "Affitto location", en: "Venue rental" },
          { it: "Catering/Banquet", en: "Catering/Banquet" },
          { it: "Torta nuziale", en: "Wedding cake" },
          { it: "Open bar/Bevande", en: "Open bar/Drinks" },
          { it: "Mise en place", en: "Tableware & setup" },
          { it: "SIAE/Permessi musica", en: "Music licenses/Permits" }
        ]
      },
      {
        name_it: "Cerimonia", name_en: "Ceremony",
        sub: [
          { it: "Chiesa/Comune", en: "Church/Town hall" },
          { it: "Decorazioni cerimonia", en: "Ceremony decor" },
          { it: "Musica cerimonia", en: "Ceremony music" },
          { it: "Officiante/Documenti", en: "Officiant/Documents" },
          { it: "Trasferte cerimonia", en: "Ceremony logistics" }
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
          { it: "Prove e ritocchi", en: "Fittings & alterations" }
        ]
      },
      {
        name_it: "Foto & Video", name_en: "Photo & Video",
        sub: [
          { it: "Fotografo", en: "Photographer" },
          { it: "Videomaker", en: "Videographer" },
          { it: "Drone", en: "Drone" },
          { it: "Album e stampe", en: "Albums & prints" },
          { it: "Anteprima/Engagement shoot", en: "Engagement shoot" }
        ]
      }
      // ... add more categories as needed
    ];

    console.log('📂 Seeding categories e subcategories...');
    let totalCats = 0;
    let totalSubs = 0;

    for (let i = 0; i < cats.length; i++) {
      const c = cats[i];
      const catRes = await client.query(`
        INSERT INTO categories (event_type_id, sort)
        VALUES ($1, $2)
        RETURNING id;
      `, [eventTypeId, i]);
      const catId = catRes.rows[0].id;
      totalCats++;

      await client.query(`
        INSERT INTO category_translations (category_id, locale, name)
        VALUES ($1, 'it-IT', $2), ($1, 'en-GB', $3)
        ON CONFLICT (category_id, locale) DO UPDATE SET name = EXCLUDED.name;
      `, [catId, c.name_it, c.name_en]);

      for (let j = 0; j < c.sub.length; j++) {
        const subRes = await client.query(`
          INSERT INTO subcategories (category_id, sort)
          VALUES ($1, $2)
          RETURNING id;
        `, [catId, j]);
        const subId = subRes.rows[0].id;
        totalSubs++;

        await client.query(`
          INSERT INTO subcategory_translations (subcategory_id, locale, name)
          VALUES ($1, 'it-IT', $2), ($1, 'en-GB', $3)
          ON CONFLICT (subcategory_id, locale) DO UPDATE SET name = EXCLUDED.name;
        `, [subId, c.sub[j].it, c.sub[j].en]);
      }
    }
    console.log(`   ✅ ${totalCats} categorie, ${totalSubs} sottocategorie\n`);

    // 4) Timeline
    const tl = [
      { key: "announce-engagement", offset: -365, it: "Annunciate il fidanzamento", en: "Announce engagement", desc_it: "Condividete la notizia con chi amate", desc_en: "Share the news with loved ones" },
      { key: "set-budget-style", offset: -330, it: "Definite budget e stile", en: "Set budget & style", desc_it: "Scegliete priorità e moodboard", desc_en: "Define priorities and moodboard" },
      { key: "book-venue-date", offset: -300, it: "Prenotate location e data", en: "Book venue & date", desc_it: "Blocca location e data con caparra", desc_en: "Secure venue and date with deposit" },
      { key: "wedding-day", offset: 0, it: "Giorno del matrimonio", en: "Wedding day", desc_it: "Godetevi la festa!", desc_en: "Enjoy the day!" },
      { key: "thank-you", offset: 14, it: "Thank-you", en: "Thank-you notes", desc_it: "Grazie e foto per gli ospiti", desc_en: "Send thanks & photos" }
    ];

    console.log('📅 Seeding event_timelines...');
    for (const t of tl) {
      const tlRes = await client.query(`
        INSERT INTO event_timelines (event_type_id, key, offset_days)
        VALUES ($1, $2, $3)
        ON CONFLICT (event_type_id, key) DO UPDATE SET offset_days = EXCLUDED.offset_days
        RETURNING id;
      `, [eventTypeId, t.key, t.offset]);
      const tlId = tlRes.rows[0].id;

      await client.query(`
        INSERT INTO event_timeline_translations (timeline_id, locale, title, description)
        VALUES
          ($1, 'it-IT', $2, $3),
          ($1, 'en-GB', $4, $5)
        ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
      `, [tlId, t.it, t.desc_it || null, t.en, t.desc_en || null]);
    }
    console.log(`   ✅ ${tl.length} timeline items\n`);

    console.log('🎉 Seed completato con successo! (Matrimonio IT/EN)');
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('❌ Errore:', e);
  process.exit(1);
});
