"use client";

import PageInfoNote from "@/components/PageInfoNote";
import { formatDate } from "@/lib/locale";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { useEffect, useState } from "react";

const supabase = getBrowserClient();

type Favorite = {
  id: string;
  item_type: "supplier" | "location" | "church";
  item_id: string;
  notes?: string;
  rating?: number;
  created_at: string;
};

type FavoriteWithDetails = Favorite & {
  name?: string;
  city?: string;
  category?: string;
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "supplier" | "location" | "church">("all");

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData.session?.access_token;

      if (!jwt) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/my/favorites", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      
      const json = await res.json();
      
      if (json.favorites) {
        // Arricchisci con i dettagli (simulato — in produzione fare join)
        const enriched = json.favorites.map((fav: Favorite) => ({
          ...fav,
          name: `${fav.item_type} #${fav.item_id.slice(0, 8)}`,
          city: "Da definire",
          category: fav.item_type,
        }));
        
        setFavorites(enriched);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(id: string) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData.session?.access_token;

      if (!jwt) return;

      await fetch(`/api/my/favorites?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      });

      setFavorites(favorites.filter(f => f.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  const filteredFavorites = filter === "all" 
    ? favorites 
    : favorites.filter(f => f.item_type === filter);

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Caricamento...</div>;
  }

  return (
    <section className="space-y-6">
      <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F5F1EB] rounded-2xl p-6 border border-gray-200">
        <h1 className="font-serif text-3xl font-bold text-gray-800 mb-2">
          ❤️ I Miei Preferiti
        </h1>
        <p className="text-gray-600">
          Tutti i fornitori, location e chiese che avete salvato in un unico posto.
        </p>
      </div>

      <PageInfoNote
        icon="❤️"
        title="Raccogli i Tuoi Fornitori Preferiti"
        description="Qui trovi tutti i fornitori, location e chiese che hai salvato mentre esploravi i database. Puoi aggiungere note personali, valutazioni e confrontarli facilmente. Quando sei pronto, contatta direttamente i preferiti o aggiungili alle spese."
        tips={[
          "Salva tutti i fornitori che ti interessano per confrontarli in seguito",
          "Aggiungi note personali (es. 'Chiamato il 15/01, molto disponibile')",
          "Usa le stelle per dare una valutazione personale a ciascun fornitore",
          "Filtra per tipo (fornitori, location, chiese) per organizzare meglio la ricerca",
          "Rimuovi dai preferiti ciò che hai scartato per mantenere la lista pulita"
        ]}
        eventTypeSpecific={{
          wedding: "Per il matrimonio, salva tutti i professionisti che ti colpiscono: fotografi, fioristi, catering, location. Confronta i preferiti prima di decidere e prenotare!",
          baptism: "Per il battesimo, concentrati su: chiese per la cerimonia, location per il rinfresco, fotografi. Salva 2-3 opzioni per categoria e confrontale.",
          birthday: "Per il compleanno, salva: location per feste, catering/ristoranti, DJ e animatori. Confronta prezzi e servizi inclusi.",
          graduation: "Per la laurea, usa i preferiti per: ristoranti/location per il ricevimento, fotografi, servizi di stampa per inviti personalizzati."
        }}
      />

      {/* Filtri */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            filter === "all"
              ? "text-white shadow-md"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          style={filter === "all" ? { background: "var(--color-sage)" } : {}}
        >
          Tutti ({favorites.length})
        </button>
        <button
          onClick={() => setFilter("supplier")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            filter === "supplier"
              ? "text-white shadow-md"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          style={filter === "supplier" ? { background: "var(--color-sage)" } : {}}
        >
          🏢 Fornitori ({favorites.filter(f => f.item_type === "supplier").length})
        </button>
        <button
          onClick={() => setFilter("location")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            filter === "location"
              ? "text-white shadow-md"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          style={filter === "location" ? { background: "var(--color-sage)" } : {}}
        >
          🏛️ Location ({favorites.filter(f => f.item_type === "location").length})
        </button>
        <button
          onClick={() => setFilter("church")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            filter === "church"
              ? "text-white shadow-md"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          style={filter === "church" ? { background: "var(--color-sage)" } : {}}
        >
          ⛪ Chiese ({favorites.filter(f => f.item_type === "church").length})
        </button>
      </div>

      {/* Lista preferiti */}
      {filteredFavorites.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">💔</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Nessun preferito ancora</h3>
          <p className="text-gray-500 mb-6">
            Inizia a salvare fornitori, location e chiese che ti piacciono!
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/fornitori"
              className="px-6 py-3 rounded-full text-white font-semibold shadow-md hover:opacity-90 transition"
              style={{ background: "var(--color-sage)" }}
            >
              Esplora Fornitori
            </Link>
            <Link
              href="/ricevimento/location"
              className="px-6 py-3 rounded-full bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Scopri Location
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFavorites.map(fav => (
            <div
              key={fav.id}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-2xl mb-2 block">
                    {fav.item_type === "supplier" ? "🏢" : fav.item_type === "location" ? "🏛️" : "⛪"}
                  </span>
                  <h3 className="font-bold text-lg text-gray-800">{fav.name}</h3>
                  <p className="text-sm text-gray-500">{fav.city}</p>
                </div>
                <button
                  onClick={() => removeFavorite(fav.id)}
                  className="text-red-500 hover:text-red-700 transition"
                  title="Rimuovi dai preferiti"
                >
                  ❤️
                </button>
              </div>

              {fav.rating && (
                <div className="mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < fav.rating! ? "text-yellow-400" : "text-gray-300"}>
                      ⭐
                    </span>
                  ))}
                </div>
              )}

              {fav.notes && (
                <p className="text-sm text-gray-600 mb-3 italic">&quot;{fav.notes}&quot;</p>
              )}

              <p className="text-xs text-gray-400">
                Salvato il {formatDate(new Date(fav.created_at))}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
