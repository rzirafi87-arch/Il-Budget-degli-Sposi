"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageCarousel from "@/components/ImageCarousel";
import { PAGE_IMAGES } from "@/lib/pageImages";
// src/components/SaveTheDateVideoPreview.tsx
import SaveTheDateVideoPreview from '@/components/SaveTheDateVideoPreview';
import { SaveTheDateVideo } from '@/components/SaveTheDateVideo';

interface WeddingCardConfig {
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  church_name: string;
  church_address: string;
  location_name: string;
  location_address: string;
  iban: string;
  bank_name: string;
  ceremony_time: string;
  reception_time: string;
  font_family: string;
  color_scheme: string;
  template_style: string;
  custom_message: string;
}

const fontOptions = [
  { value: 'Playfair Display', label: 'Playfair Display (Elegante)' },
  { value: 'Great Vibes', label: 'Great Vibes (Corsivo)' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond (Classico)' },
  { value: 'Dancing Script', label: 'Dancing Script (Romantico)' },
  { value: 'Cinzel', label: 'Cinzel (Formale)' },
  { value: 'Italiana', label: 'Italiana (Moderno)' }
];

const colorSchemes = [
  { value: 'classic', label: 'Classico (Oro e Avorio)' },
  { value: 'modern', label: 'Moderno (Nero e Bianco)' },
  { value: 'rustic', label: 'Rustico (Verde Salvia)' },
  { value: 'romantic', label: 'Romantico (Rosa e Pesca)' },
  { value: 'luxury', label: 'Luxury (Blu Navy e Oro)' }
];

const templateStyles = [
  { value: 'elegant', label: 'Elegante' },
  { value: 'minimal', label: 'Minimalista' },
  { value: 'floral', label: 'Floreale' },
  { value: 'vintage', label: 'Vintage' }
];

export default function PartecipazionePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [config, setConfig] = useState<WeddingCardConfig>({
    bride_name: '',
    groom_name: '',
    wedding_date: '',
    church_name: '',
    church_address: '',
    location_name: '',
    location_address: '',
    iban: '',
    bank_name: '',
    ceremony_time: '',
    reception_time: '',
    font_family: 'Playfair Display',
    color_scheme: 'classic',
    template_style: 'elegant',
    custom_message: ''
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wedding-card');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (err) {
      console.error('Errore caricamento configurazione:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wedding-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (res.ok) {
        alert('Configurazione salvata con successo!');
      } else {
        alert('Errore nel salvataggio');
      }
    } catch (err) {
      console.error('Errore salvataggio:', err);
      alert('Errore nel salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-wedding-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `partecipazione-${config.bride_name}-${config.groom_name}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Errore nella generazione del PDF');
      }
    } catch (err) {
      console.error('Errore generazione PDF:', err);
      alert('Errore nella generazione del PDF');
    } finally {
      setGenerating(false);
    }
  };

  // Stub: Generazione video Save the Date
  const handleGenerateVideo = async () => {
    setGenerating(true);
    try {
      // Qui si potrà integrare Remotion o ffmpeg.js per generare il video
      alert('Funzione video in sviluppo: sarà possibile scaricare un video Save the Date personalizzato!');
    } finally {
      setGenerating(false);
    }
  };

  // Props per il video
  const videoProps = {
    bride: config.bride_name,
    groom: config.groom_name,
    date: config.wedding_date,
    location: config.location_name,
    message: config.custom_message
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#A3B59D]">
          💌 Crea il tuo Save the Date
        </h1>

        {/* Carosello immagini */}
        <ImageCarousel images={PAGE_IMAGES["save-the-date"]} height="280px" />

        <div className="space-y-6">
          {/* Informazioni Sposi */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">👰🤵 Informazioni Sposi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome Sposa</label>
                <input
                  type="text"
                  value={config.bride_name}
                  onChange={(e) => setConfig({ ...config, bride_name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Maria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nome Sposo</label>
                <input
                  type="text"
                  value={config.groom_name}
                  onChange={(e) => setConfig({ ...config, groom_name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Giovanni"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data Matrimonio</label>
                <input
                  type="date"
                  value={config.wedding_date}
                  onChange={(e) => setConfig({ ...config, wedding_date: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Chiesa */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">⛪ Cerimonia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome Chiesa</label>
                <input
                  type="text"
                  value={config.church_name}
                  onChange={(e) => setConfig({ ...config, church_name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Chiesa di Santa Maria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Indirizzo Chiesa</label>
                <input
                  type="text"
                  value={config.church_address}
                  onChange={(e) => setConfig({ ...config, church_address: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Via Roma, 1 - Milano"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Orario Cerimonia</label>
                <input
                  type="time"
                  value={config.ceremony_time}
                  onChange={(e) => setConfig({ ...config, ceremony_time: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Ricevimento */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">🍽️ Ricevimento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome Location</label>
                <input
                  type="text"
                  value={config.location_name}
                  onChange={(e) => setConfig({ ...config, location_name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Villa Borromeo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Indirizzo Location</label>
                <input
                  type="text"
                  value={config.location_address}
                  onChange={(e) => setConfig({ ...config, location_address: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Via Trionfale, 151 - Roma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Orario Ricevimento</label>
                <input
                  type="time"
                  value={config.reception_time}
                  onChange={(e) => setConfig({ ...config, reception_time: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Bonifico (Opzionale) */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">💳 Informazioni Bonifico (Facoltativo)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">IBAN</label>
                <input
                  type="text"
                  value={config.iban}
                  onChange={(e) => setConfig({ ...config, iban: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="IT60 X054 2811 1010 0000 0123 456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Banca</label>
                <input
                  type="text"
                  value={config.bank_name}
                  onChange={(e) => setConfig({ ...config, bank_name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Intesa Sanpaolo"
                />
              </div>
            </div>
          </div>

          {/* Design */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">🎨 Personalizzazione</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Font Nomi</label>
                <select
                  value={config.font_family}
                  onChange={(e) => setConfig({ ...config, font_family: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  {fontOptions.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Schema Colori</label>
                <select
                  value={config.color_scheme}
                  onChange={(e) => setConfig({ ...config, color_scheme: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  {colorSchemes.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stile Template</label>
                <select
                  value={config.template_style}
                  onChange={(e) => setConfig({ ...config, template_style: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  {templateStyles.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Messaggio Personalizzato */}
          <div>
            <h2 className="text-xl font-semibold mb-4">💌 Messaggio Personalizzato</h2>
            <textarea
              value={config.custom_message}
              onChange={(e) => setConfig({ ...config, custom_message: e.target.value })}
              className="w-full border rounded px-3 py-2 h-24"
              placeholder="Saremo felici di condividere con voi il giorno più importante della nostra vita..."
            />
          </div>

          {/* Azioni */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-[#A3B59D] text-white py-3 px-6 rounded font-semibold hover:bg-[#8da182] disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : '💾 Salva Configurazione'}
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={generating || !config.bride_name || !config.groom_name}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? 'Generazione...' : '📥 Genera PDF'}
            </button>
            <button
              onClick={handleGenerateVideo}
              disabled={generating || !config.bride_name || !config.groom_name}
              className="flex-1 bg-pink-600 text-white py-3 px-6 rounded font-semibold hover:bg-pink-700 disabled:opacity-50"
            >
              {generating ? 'Generazione...' : '🎬 Genera Video'}
            </button>
          </div>

          {/* Preview Video Save the Date */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4 text-[#A3B59D]">Anteprima Video Save the Date</h2>
            <SaveTheDateVideoPreview {...videoProps} />
          </div>
        </div>
      </div>
    </div>
  );
}
