"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";

const supabase = getBrowserClient();

type Supplier = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  region: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  priceRange: string;
  rating: number;
  source: string; // matrimonio.com, zankyou.it, etc.
};

// Regioni italiane
const REGIONS = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
  "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
  "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
];

// Stesse categorie della dashboard
const CATEGORIES = [
  "Abiti & Accessori (altri)", "Cerimonia", "Fiori & Decor", "Foto & Video",
  "Inviti & Stationery", "Sposa", "Sposo", "Location & Catering",
  "Musica & Intrattenimento", "Trasporti", "Bomboniere & Regali",
  "Ospitalità & Logistica", "Burocrazia", "Beauty & Benessere",
  "Viaggio di nozze", "Comunicazione & Media", "Extra & Contingenze"
];

export default function FornitoriPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: "",
    category: CATEGORIES[0],
    subcategory: "",
    region: REGIONS[0],
    province: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    priceRange: "€€",
  });

  useEffect(() => {
    loadSuppliers();
  }, [selectedRegion, selectedProvince, selectedCategory]);

  const loadSuppliers = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;

      const headers: HeadersInit = {};
      if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
      }

      const params = new URLSearchParams();
      if (selectedRegion) params.append("region", selectedRegion);
      if (selectedProvince) params.append("province", selectedProvince);
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);

      const r = await fetch(`/api/suppliers?${params.toString()}`, { headers });
      const j = await r.json();

      setSuppliers(j.suppliers || []);
    } catch (err) {
      console.error("Errore caricamento:", err);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const submitNewSupplier = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;

      if (!jwt) {
        setMessage("❌ Devi essere autenticato per proporre un fornitore. Clicca su 'Registrati' in alto.");
        return;
      }

      const r = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(newSupplier),
      });

      if (r.ok) {
        setMessage("✅ Fornitore proposto con successo! Sarà revisionato dal nostro team.");
        setShowAddForm(false);
        setNewSupplier({
          name: "",
          category: CATEGORIES[0],
          subcategory: "",
          region: REGIONS[0],
          province: "",
          city: "",
          address: "",
          phone: "",
          email: "",
          website: "",
          description: "",
          priceRange: "€€",
        });
        setTimeout(() => setMessage(null), 5000);
      } else {
        const j = await r.json();
        setMessage(`❌ Errore: ${j.error || "Impossibile inviare"}`);
      }
    } catch (err) {
      console.error("Errore:", err);
      setMessage("❌ Errore di rete");
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-6">Fornitori</h2>

      {message && (
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm">
          {message}
        </div>
      )}

      {/* Filtri */}
      <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
        <h3 className="font-semibold mb-4">Filtra fornitori</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Regione</label>
            <select
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedProvince("");
              }}
            >
              <option value="">Tutte le regioni</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              placeholder="Es. Milano"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Tutte le categorie</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cerca</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nome fornitore..."
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={loadSuppliers}
            className="bg-[#A3B59D] text-white rounded-lg px-4 py-2 hover:bg-[#8a9d84]"
          >
            Cerca
          </button>
          <button
            onClick={() => {
              setSelectedRegion("");
              setSelectedProvince("");
              setSelectedCategory("");
              setSearchQuery("");
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            Resetta filtri
          </button>
        </div>
      </div>

      {/* Bottone proponi fornitore */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="border border-[#A3B59D] text-[#A3B59D] rounded-lg px-4 py-2 hover:bg-[#A3B59D] hover:text-white"
        >
          {showAddForm ? "Annulla" : "💡 Proponi un nuovo fornitore"}
        </button>
      </div>

      {/* Form proponi fornitore */}
      {showAddForm && (
        <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
          <h3 className="font-semibold mb-4">Proponi un nuovo fornitore</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome fornitore *</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newSupplier.category}
                onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regione *</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newSupplier.region}
                onChange={(e) => setNewSupplier({ ...newSupplier, region: e.target.value })}
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newSupplier.province}
                onChange={(e) => setNewSupplier({ ...newSupplier, province: e.target.value })}
                placeholder="Es. Milano"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newSupplier.city}
                onChange={(e) => setNewSupplier({ ...newSupplier, city: e.target.value })}
                placeholder="Es. Milano"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                placeholder="+39 ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sito web</label>
              <input
                type="url"
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={newSupplier.website}
                onChange={(e) => setNewSupplier({ ...newSupplier, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
              <textarea
                className="border border-gray-300 rounded px-3 py-2 w-full"
                rows={3}
                value={newSupplier.description}
                onChange={(e) => setNewSupplier({ ...newSupplier, description: e.target.value })}
                placeholder="Breve descrizione del fornitore..."
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={submitNewSupplier}
              className="bg-[#A3B59D] text-white rounded-lg px-6 py-2 hover:bg-[#8a9d84]"
            >
              Invia proposta
            </button>
          </div>
        </div>
      )}

      {/* Lista fornitori */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500">Caricamento...</p>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-10 text-center text-gray-400 rounded-2xl border border-gray-200 bg-white/70">
            Nessun fornitore trovato con questi filtri
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="p-6 rounded-2xl border border-gray-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{supplier.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {supplier.category} • {supplier.city}, {supplier.province} ({supplier.region})
                  </div>
                  {supplier.description && (
                    <p className="text-sm text-gray-700 mt-2">{supplier.description}</p>
                  )}
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    {supplier.phone && <span>📞 {supplier.phone}</span>}
                    {supplier.email && <span>✉️ {supplier.email}</span>}
                    {supplier.website && (
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        🌐 Sito web
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">{supplier.priceRange}</div>
                  {supplier.rating > 0 && (
                    <div className="text-xs text-yellow-600 mt-1">
                      {"⭐".repeat(Math.round(supplier.rating))}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    {supplier.source}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
