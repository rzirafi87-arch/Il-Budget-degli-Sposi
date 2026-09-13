"use client";
import React, { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import ImageCarousel from "@/components/ImageCarousel";
import { getUserCountrySafe } from "@/constants/geo";
import { getPageImages } from "@/lib/pageImages";
import SaveTheDateVideoPreview from "@/components/SaveTheDateVideoPreview";
import { useTranslations } from "next-intl";

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

const fontOptions = ["Playfair Display", "Great Vibes", "Cormorant Garamond", "Dancing Script", "Cinzel", "Italiana"];
const colorSchemes = ["classic", "modern", "rustic", "romantic", "luxury"];
const templateStyles = ["elegant", "minimal", "floral", "vintage"];

export default function PartecipazionePage() {
  const supabase = getBrowserClient();
  const t = useTranslations("milestone7.saveTheDate");
  const country = getUserCountrySafe();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [config, setConfig] = useState<WeddingCardConfig>({
    bride_name: "",
    groom_name: "",
    wedding_date: "",
    church_name: "",
    church_address: "",
    location_name: "",
    location_address: "",
    iban: "",
    bank_name: "",
    ceremony_time: "",
    reception_time: "",
    font_family: "Playfair Display",
    color_scheme: "classic",
    template_style: "elegant",
    custom_message: "",
  });

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) return;

      const res = await fetch("/api/wedding-card", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) setConfig(data.config);
      }
    } catch (e) {
      console.error("Errore caricamento configurazione:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) {
        alert(t("authSave"));
        return;
      }

      const res = await fetch("/api/wedding-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(config),
      });
      if (res.ok) alert(t("saved"));
      else alert(t("saveError"));
    } catch (e) {
      console.error("Errore salvataggio:", e);
      alert(t("saveError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePDF() {
    setGenerating(true);
    try {
      const { data } = await supabase.auth.getSession();
      const jwt = data.session?.access_token;
      if (!jwt) {
        alert(t("authPdf"));
        return;
      }
      const res = await fetch("/api/generate-wedding-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `partecipazione-${config.bride_name}-${config.groom_name}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert(t("pdfError"));
      }
    } catch (e) {
      console.error("Errore generazione PDF:", e);
      alert(t("pdfError"));
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateVideo() {
    setGenerating(true);
    try {
      alert(
        t("videoComingSoon"),
      );
    } finally {
      setGenerating(false);
    }
  }

  const videoProps = {
    bride: config.bride_name,
    groom: config.groom_name,
    date: config.wedding_date,
    location: config.location_name,
    message: config.custom_message,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#A3B59D]">📣 {t("title")}</h1>

        <ImageCarousel images={getPageImages("save-the-date", country)} height="280px" />

        <div className="space-y-6">
          {/* Informazioni Sposi */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">👰🤵 {t("couple")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("brideName")}</label>
                <input
                  type="text"
                  value={config.bride_name}
                  onChange={(e) => setConfig({ ...config, bride_name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder={t("bridePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("groomName")}</label>
                <input
                  type="text"
                  value={config.groom_name}
                  onChange={(e) => setConfig({ ...config, groom_name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder={t("groomPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("weddingDate")}</label>
                <input
                  type="date"
                  value={config.wedding_date}
                  onChange={(e) => setConfig({ ...config, wedding_date: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Cerimonia */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">⛪ {t("ceremony")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("ceremonyName")}</label>
                <input
                  type="text"
                  value={config.church_name}
                  onChange={(e) => setConfig({ ...config, church_name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder={t("ceremonyPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("ceremonyAddress")}</label>
                <input
                  type="text"
                  value={config.church_address}
                  onChange={(e) => setConfig({ ...config, church_address: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder={t("addressPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("ceremonyTime")}</label>
                <input
                  type="time"
                  value={config.ceremony_time}
                  onChange={(e) => setConfig({ ...config, ceremony_time: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Location / Ricevimento */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">🏛️ {t("reception")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("venueName")}</label>
                <input
                  type="text"
                  value={config.location_name}
                  onChange={(e) => setConfig({ ...config, location_name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder={t("venuePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("venueAddress")}</label>
                <input
                  type="text"
                  value={config.location_address}
                  onChange={(e) => setConfig({ ...config, location_address: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder={t("addressPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("receptionTime")}</label>
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
            <h2 className="text-xl font-semibold mb-4">💳 {t("bankDetails")}</h2>
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
                <label className="block text-sm font-medium mb-2">{t("bank")}</label>
                <input
                  type="text"
                  value={config.bank_name}
                  onChange={(e) => setConfig({ ...config, bank_name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder={t("bankPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Design */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">🎨 {t("customization")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("nameFont")}</label>
                <select
                  value={config.font_family}
                  onChange={(e) => setConfig({ ...config, font_family: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  {fontOptions.map((font) => (
                    <option key={font} value={font}>
                      {t(`fonts.${font}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("colorScheme")}</label>
                <select
                  value={config.color_scheme}
                  onChange={(e) => setConfig({ ...config, color_scheme: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  {colorSchemes.map((scheme) => (
                    <option key={scheme} value={scheme}>
                      {t(`colors.${scheme}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("templateStyle")}</label>
                <select
                  value={config.template_style}
                  onChange={(e) => setConfig({ ...config, template_style: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  {templateStyles.map((style) => (
                    <option key={style} value={style}>
                      {t(`styles.${style}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Messaggio Personalizzato */}
          <div>
            <h2 className="text-xl font-semibold mb-4">📝 {t("customMessage")}</h2>
            <textarea
              value={config.custom_message}
              onChange={(e) => setConfig({ ...config, custom_message: e.target.value })}
              className="w-full border rounded px-3 py-2 h-24"
              placeholder={t("messagePlaceholder")}
            />
          </div>

          {/* Azioni */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-[#A3B59D] text-white py-3 px-6 rounded font-semibold hover:bg-[#8da182] disabled:opacity-50"
            >
              {loading ? t("saving") : `💾 ${t("save")}`}
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={generating || !config.bride_name || !config.groom_name}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? t("generating") : `📄 ${t("generatePdf")}`}
            </button>
            <button
              onClick={handleGenerateVideo}
              disabled={generating || !config.bride_name || !config.groom_name}
              className="flex-1 bg-pink-600 text-white py-3 px-6 rounded font-semibold hover:bg-pink-700 disabled:opacity-50"
            >
              {generating ? t("generating") : `🎬 ${t("generateVideo")}`}
            </button>
          </div>

          {/* Preview Video Save the Date */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4 text-[#A3B59D]">{t("videoPreview")}</h2>
            <SaveTheDateVideoPreview {...videoProps} />
          </div>
        </div>
      </div>
    </div>
  );
}
