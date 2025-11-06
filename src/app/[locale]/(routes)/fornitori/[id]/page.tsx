"use client";

import { getBrowserClient } from "@/lib/supabaseBrowser";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type SupplierView = {
  id: string;
  name: string;
  category: string | null;
  region: string;
  province: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  verified: boolean;
  description: string | null;
  photo_urls: string[] | null;
  video_urls: string[] | null;
  discount_info: string | null;
  canEdit?: boolean;
};

export default function SupplierPublicPage() {
  const params = useParams<{ id: string }>();
  const supplierId = useMemo(() => (Array.isArray(params.id) ? params.id[0] : params.id), [params.id]);

  const [data, setData] = useState<SupplierView | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Editable state
  const [description, setDescription] = useState("");
  const [photosInput, setPhotosInput] = useState("");
  const [videosInput, setVideosInput] = useState("");
  const [discount, setDiscount] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const supabase = getBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;
      const headers: HeadersInit = {};
      if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
      const res = await fetch(`/api/suppliers/${supplierId}`, { headers });
      const json: SupplierView = await res.json();
      if (!alive) return;
      setData(json);
      setDescription(json.description ?? "");
      setPhotosInput((json.photo_urls ?? []).join("\n"));
      setVideosInput((json.video_urls ?? []).join("\n"));
      setDiscount(json.discount_info ?? "");
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [supplierId]);

  const photos = useMemo(
    () => (photosInput ? photosInput.split(/\n|,\s*/).map((s) => s.trim()).filter(Boolean) : []),
    [photosInput]
  );
  const videos = useMemo(
    () => (videosInput ? videosInput.split(/\n|,\s*/).map((s) => s.trim()).filter(Boolean) : []),
    [videosInput]
  );

  async function onSave() {
    setSaving(true);
    try {
      const supabase = getBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
      const res = await fetch(`/api/suppliers/${supplierId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          description,
          photo_urls: photos,
          video_urls: videos,
          discount_info: discount,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Errore salvataggio");
      }
      setData((prev) => (prev ? { ...prev, description, photo_urls: photos, video_urls: videos, discount_info: discount } : prev));
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      const supabase = getBrowserClient();
      // ensure auth for upload
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        alert("Devi essere autenticato per caricare immagini.");
        return;
      }

      const bucket = supabase.storage.from("suppliers");
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
        const path = `supplier/${supplierId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${cleanName}`;
        const { error: upErr } = await bucket.upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = bucket.getPublicUrl(path);
        if (pub?.publicUrl) newUrls.push(pub.publicUrl);
      }

      // Merge and persist immediately
      const merged = [...photos, ...newUrls];
      setPhotosInput(merged.join("\n"));

      // Persist via API
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const jwt = sessionData.session.access_token;
      if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
      const res = await fetch(`/api/suppliers/${supplierId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ photo_urls: merged }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Errore salvataggio immagini");
      }
      setData((prev) => (prev ? { ...prev, photo_urls: merged } : prev));
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setUploading(false);
      // reset input so same files can be reselected if needed
      (e.target as HTMLInputElement).value = "";
    }
  }

  async function removePhoto(url: string) {
    if (!data?.canEdit) return;
    const supabase = getBrowserClient();
    try {
      // Try to delete from Supabase Storage if the URL belongs to our public bucket
      const marker = "/storage/v1/object/public/";
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        const sub = url.slice(idx + marker.length); // e.g., suppliers/supplier/.../file.jpg
        const [bucketId, ...rest] = sub.split("/");
        const objectPath = rest.join("/");
        if (bucketId === "suppliers" && objectPath) {
          await supabase.storage.from("suppliers").remove([objectPath]);
        }
      }

      // Update DB list regardless (also handles external URLs)
      const newList = (data.photo_urls ?? []).filter((u) => u !== url);
      const { data: sessionData } = await supabase.auth.getSession();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const jwt = sessionData?.session?.access_token;
      if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
      const res = await fetch(`/api/suppliers/${supplierId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ photo_urls: newList }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Errore rimozione immagine");
      }
      setData((prev) => (prev ? { ...prev, photo_urls: newList } : prev));
      setPhotosInput(newList.join("\n"));
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    }
  }

  function renderVideo(url: string, idx: number) {
    const isYouTube = /youtu\.?be/.test(url);
    if (isYouTube) {
      // Basic YouTube embed
  const videoIdMatch = url.match(/(?:v=|be\/)\s*([^&?\/]*)/);
      const videoId = videoIdMatch?.[1] || "";
      const embedSrc = `https://www.youtube.com/embed/${videoId}`;
      return (
        <iframe
          key={`vid-${idx}`}
          className="w-full aspect-video rounded-lg border"
          src={embedSrc}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    }
    return (
      <a key={`vid-${idx}`} href={url} target="_blank" rel="noreferrer" className="text-[#A3B59D] underline">
        Guarda video {idx + 1}
      </a>
    );
  }

  if (loading) {
    return <div className="py-10 text-gray-500">Caricamento fornitore…</div>;
  }
  if (!data) {
    return <div className="py-10 text-red-600">Fornitore non trovato.</div>;
  }

  return (
    <section className="pt-6">
      <h1 className="font-serif text-3xl mb-1">{data.name}</h1>
      <p className="text-gray-600 mb-4">
        {data.category ?? "Fornitore"} · {data.city} ({data.province}) · {data.region}
      </p>

      {/* Public details */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Galleria immagini */}
          {photos.length > 0 && (
            <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((src, i) => (
                <div key={`img-${i}`} className="relative w-full h-40 group">
                  <Image
                    src={src}
                    alt={`Foto ${i + 1} di ${data.name}`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 33vw"
                    className="object-cover rounded-lg border"
                    unoptimized
                  />
                  {data.canEdit && (
                    <button
                      onClick={() => removePhoto(src)}
                      className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                      title="Elimina foto"
                    >
                      Elimina
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Descrizione */}
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-2">Descrizione</h2>
            <p className="whitespace-pre-wrap text-gray-800 bg-white/60 rounded-xl p-4 border">
              {description || "Il fornitore non ha ancora aggiunto una descrizione."}
            </p>
          </div>

          {/* Video */}
          {videos.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold text-lg mb-2">Video</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {videos.map((v, idx) => renderVideo(v, idx))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar contatti / sconti */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border p-4 bg-white/70">
            <h3 className="font-semibold mb-2">Contatti</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {data.address && <li>📍 {data.address}</li>}
              {data.phone && <li>📞 {data.phone}</li>}
              {data.email && <li>✉️ {data.email}</li>}
              {data.website && (
                <li>
                  🌐 <a href={data.website} className="text-[#A3B59D] underline" target="_blank" rel="noreferrer">Sito web</a>
                </li>
              )}
            </ul>
          </div>

          {(discount || data.discount_info) && (
            <div className="rounded-xl border p-4 bg-[#A3B59D]/10 border-[#A3B59D]/40">
              <h3 className="font-semibold mb-2">🎁 Sconti e promozioni</h3>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{discount || data.discount_info}</p>
            </div>
          )}
        </aside>
      </div>

      {/* Editor per il proprietario */}
      {data.canEdit && (
        <div className="mt-10 p-6 rounded-2xl border-2 border-dashed border-[#A3B59D]/40 bg-white/70">
          <h2 className="font-semibold text-xl mb-4">Modifica la tua pagina</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold">Descrizione</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                className="w-full border rounded-lg p-3"
                placeholder="Racconta chi sei, cosa offri e perché gli sposi dovrebbero scegliere te."
              />

              <label className="block text-sm font-semibold">Sconti e promozioni</label>
              <textarea
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                rows={4}
                className="w-full border rounded-lg p-3"
                placeholder="Eventuali sconti o promozioni (es. -10% prenotando entro il 31/12)."
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold">Carica foto</label>
              <input type="file" accept="image/*" multiple onChange={onFilesSelected} className="block w-full" />
              {uploading && <div className="text-sm text-gray-500">Caricamento in corso…</div>}

              <label className="block text-sm font-semibold">Foto (uno per riga)</label>
              <textarea
                value={photosInput}
                onChange={(e) => setPhotosInput(e.target.value)}
                rows={8}
                className="w-full border rounded-lg p-3 font-mono text-xs"
                placeholder="https://.../foto1.jpg\nhttps://.../foto2.jpg"
              />

              <label className="block text-sm font-semibold">Video (uno per riga)</label>
              <textarea
                value={videosInput}
                onChange={(e) => setVideosInput(e.target.value)}
                rows={6}
                className="w-full border rounded-lg p-3 font-mono text-xs"
                placeholder="https://youtu.be/xyz\nhttps://.../video.mp4"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-[#A3B59D] text-white font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Salvataggio…" : "Salva modifiche"}
            </button>
            <p className="text-sm text-gray-500 self-center">Le modifiche sono visibili a tutti.</p>
          </div>
        </div>
      )}
    </section>
  );
}
