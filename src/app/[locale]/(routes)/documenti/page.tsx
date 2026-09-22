"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent } from "react";
import PageInfoNote from "@/components/PageInfoNote";
import { formatDate } from "@/lib/locale";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { buttonClasses } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { CalendarDays, Download, FileArchive, FileText, Inbox, Trash2, UploadCloud } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type Document = {
  id: string;
  name: string;
  category: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  notes?: string | null;
};

const DOCUMENT_CATEGORIES = ["quote", "contract", "invoice", "receipt", "generic", "certificate", "license"] as const;

export default function DocumentiPage() {
  const locale = useLocale();
  const t = useTranslations("milestone7.documents");
  const supabase = getBrowserClient();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  async function bearer() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("AUTHENTICATION_REQUIRED");
    return token;
  }

  async function loadDocuments() {
    setLoading(true);
    setError(null);
    try {
      const token = await bearer();
      const res = await fetch("/api/my/documents", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "EVENT_DOCUMENTS_READ_FAILED");
      setDocuments(json.documents || []);
    } catch {
      setError(t("operationError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });
    setError(null);
    try {
      const token = await bearer();
      for (let index = 0; index < files.length; index += 1) {
        const form = new FormData();
        form.append("file", files[index]);
        form.append("category", "generic");
        const res = await fetch("/api/my/documents", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "EVENT_DOCUMENT_UPLOAD_FAILED");
        setUploadProgress({ current: index + 1, total: files.length });
      }
      await loadDocuments();
    } catch {
      setError(t("operationError"));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const deleteDocument = async (id: string) => {
    if (!window.confirm(t("confirmDelete"))) return;
    setError(null);
    try {
      const token = await bearer();
      const res = await fetch(`/api/my/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "EVENT_DOCUMENT_DELETE_FAILED");
      setDocuments((current) => current.filter((document) => document.id !== id));
    } catch {
      setError(t("operationError"));
    }
  };

  const downloadDocument = async (id: string) => {
    setError(null);
    try {
      const token = await bearer();
      const res = await fetch(`/api/my/documents/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "EVENT_DOCUMENT_DOWNLOAD_FAILED");
      window.location.assign(json.url);
    } catch {
      setError(t("operationError"));
    }
  };

  const categories = ["all", ...DOCUMENT_CATEGORIES];
  const filteredDocs = filter === "all"
    ? documents
    : documents.filter((document) => document.category === filter);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        icon={<FileArchive size={24} aria-hidden />}
      />

      <PageInfoNote
        icon="📁"
        title={t("infoTitle")}
        description={t("infoDescription")}
        tips={Array.from({ length: 6 }, (_, index) => t(`tips.${index + 1}`))}
        eventTypeSpecific={{
          wedding: t("events.wedding"), baptism: t("events.baptism"),
          birthday: t("events.birthday"), graduation: t("events.graduation")
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`/${locale}/documenti/appuntamenti`}
          className="app-card app-card--md app-card--interactive flex items-center gap-4"
        >
          <span className="app-page-header__icon"><CalendarDays size={23} aria-hidden /></span>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{t("agendaTitle")}</h2>
            <p className="text-sm text-gray-600">{t("agendaDescription")}</p>
          </div>
        </Link>
      </div>

      {error && (
        <div role="alert" className="app-card app-card--md border border-red-200 bg-red-50 text-sm text-red-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <button type="button" className="app-button app-button--sm app-button--outline" onClick={() => void loadDocuments()}>
              {t("retry")}
            </button>
          </div>
        </div>
      )}

      <div className="app-card border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-gray-400">
        <label className={`block ${uploading ? "cursor-wait" : "cursor-pointer"}`}>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className="text-center">
            <UploadCloud className="mx-auto mb-3 text-primary" size={42} strokeWidth={1.6} aria-hidden />
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              {uploading
                ? `${t("uploading")} ${uploadProgress.current}/${uploadProgress.total}`
                : t("upload")}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{t("uploadHelper")}</p>
            <p className="text-xs text-gray-400">{t("uploadFormatsSecure")}</p>
          </div>
        </label>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`app-button app-button--sm whitespace-nowrap ${
              filter === category ? "app-button--primary" : "app-button--outline"
            }`}
          >
            {t(`categories.${category}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">{t("loading")}</div>
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={<Inbox size={26} />}
          title={documents.length === 0 ? t("empty") : t("emptyCategory")}
          description={documents.length === 0 ? t("emptyDescription") : t("emptyCategoryDescription")}
        />
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((document) => (
            <div key={document.id} className="app-card app-card--md app-card--interactive">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "var(--color-beige)" }}>
                  <FileText size={22} aria-hidden />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{document.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {t(`categories.${document.category}`)}
                        </span>
                        <span className="text-xs text-gray-500">{t("unassigned")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void downloadDocument(document.id)}
                        className={buttonClasses({ variant: "ghost", size: "icon" })}
                        title={t("download")}
                        aria-label={t("downloadNamed", { name: document.name })}
                      >
                        <Download size={18} aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteDocument(document.id)}
                        className={buttonClasses({ variant: "ghost", size: "icon", className: "text-red-600" })}
                        title={t("delete")}
                        aria-label={t("deleteNamed", { name: document.name })}
                      >
                        <Trash2 size={18} aria-hidden />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatFileSize(document.fileSize)}</span>
                    <span>•</span>
                    <span>{formatDate(new Date(document.uploadedAt))}</span>
                  </div>

                  {document.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">&quot;{document.notes}&quot;</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {documents.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--color-sage)" }}>{documents.length}</div>
              <div className="text-sm text-gray-600">{t("stats.total")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--color-sage)" }}>
                {documents.filter((document) => document.category === "quote").length}
              </div>
              <div className="text-sm text-gray-600">{t("stats.quotes")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--color-sage)" }}>
                {documents.filter((document) => document.category === "contract").length}
              </div>
              <div className="text-sm text-gray-600">{t("stats.contracts")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--color-sage)" }}>
                {(documents.reduce((sum, document) => sum + document.fileSize, 0) / (1024 * 1024)).toFixed(1)} MB
              </div>
              <div className="text-sm text-gray-600">{t("stats.storage")}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
