"use client";

import { useState } from "react";
import Link from "next/link";
import PageInfoNote from "@/components/PageInfoNote";
import { formatDate } from "@/lib/locale";
import { buttonClasses } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { CalendarDays, Download, FileArchive, FileText, Inbox, Trash2, UploadCloud } from "lucide-react";
import { useLocale } from "next-intl";

type Document = {
  id: string;
  name: string;
  category: string;
  supplier: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  notes?: string;
};

const DOCUMENT_CATEGORIES = [
  "Preventivo",
  "Contratto",
  "Fattura",
  "Ricevuta",
  "Documento generico",
  "Certificato",
  "Licenza",
];

export default function DocumentiPage() {
  const locale = useLocale();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<string>("Tutti");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    // Simulazione upload (in produzione: Supabase Storage)
    setTimeout(() => {
      const newDocs: Document[] = Array.from(files).map((file, idx) => ({
        id: `doc-${Date.now()}-${idx}`,
        name: file.name,
        category: "Documento generico",
        supplier: "Da assegnare",
        fileUrl: URL.createObjectURL(file),
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      }));
      
      setDocuments([...newDocs, ...documents]);
      setUploading(false);
    }, 1500);
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  const categories = ["Tutti", ...DOCUMENT_CATEGORIES];
  const filteredDocs = filter === "Tutti" 
    ? documents 
    : documents.filter(d => d.category === filter);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Archivio digitale"
        title="Documenti e preventivi"
        description="Carica e organizza preventivi, contratti, ricevute e tutti i documenti importanti del tuo evento."
        icon={<FileArchive size={24} aria-hidden />}
      />

      <PageInfoNote
        icon="📁"
        title="Archivio Digitale dei Tuoi Documenti"
        description="Centralizza tutti i documenti importanti in un unico posto sicuro. Carica preventivi ricevuti dai fornitori, contratti firmati, fatture, ricevute di pagamento e certificati. Ogni documento può essere categorizzato, associato a un fornitore e dotato di note."
        tips={[
          "Carica i preventivi appena li ricevi per confrontarli facilmente",
          "Associa ogni documento al fornitore corrispondente per una migliore organizzazione",
          "Usa la categoria 'Contratto' per i documenti già firmati e confermati",
          "Le ricevute e le fatture ti servono per la contabilità finale e le dichiarazioni fiscali",
          "Filtra per categoria per trovare rapidamente ciò che cerchi",
          "Formati supportati: PDF, DOC, DOCX, JPG, PNG (fino a 10MB per file)"
        ]}
        eventTypeSpecific={{
          wedding: "Per il matrimonio, organizza documenti per: location, catering, fotografi, fioristi, abiti, musica, chiese. Tieni tutto sotto controllo in un archivio digitale!",
          baptism: "Per il battesimo, carica: certificato di battesimo, preventivi della location per il rinfresco, contratti del fotografo, fatture del catering.",
          birthday: "Per il compleanno, conserva: contratto della location, preventivi del catering/ristorante, accordi con DJ/intrattenimento, fatture delle decorazioni.",
          graduation: "Per la laurea, archivia: prenotazione ristorante/location, preventivi del catering per il buffet, contratto fotografo, fatture per stampa inviti e gadget."
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`/${locale}/documenti/appuntamenti`}
          className="app-card app-card--md app-card--interactive flex items-center gap-4"
        >
          <span className="app-page-header__icon"><CalendarDays size={23} aria-hidden /></span>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Agenda Documenti</h2>
            <p className="text-sm text-gray-600">
              Organizza sopralluoghi, scadenze e incontri legati ai documenti caricati.
            </p>
          </div>
        </Link>
      </div>

      {/* Upload Area */}
      <div className="app-card border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-gray-400">
        <label className="block cursor-pointer">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className="text-center">
            <UploadCloud className="mx-auto mb-3 text-primary" size={42} strokeWidth={1.6} aria-hidden />
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              {uploading ? "Caricamento in corso..." : "Carica Documenti"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Clicca per selezionare o trascina qui i file
            </p>
            <p className="text-xs text-gray-400">
              PDF, Word, Immagini • Max 10 MB per file
            </p>
          </div>
        </label>
      </div>

      {/* Filtri */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`app-button app-button--sm whitespace-nowrap ${
              filter === cat
                ? "app-button--primary"
                : "app-button--outline"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista Documenti */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={<Inbox size={26} />}
          title={documents.length === 0 ? "Nessun documento caricato" : "Nessun documento in questa categoria"}
          description={documents.length === 0 ? "Carica il primo preventivo o contratto per costruire il tuo archivio." : "Scegli un’altra categoria per visualizzare i documenti disponibili."}
        />
      ) : (
        <div className="space-y-3">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="app-card app-card--md app-card--interactive"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "var(--color-beige)" }}>
                  <FileText size={22} aria-hidden />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{doc.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {doc.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {doc.supplier}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.fileUrl}
                        download
                        className={buttonClasses({ variant: "ghost", size: "icon" })}
                        title="Scarica"
                        aria-label={`Scarica ${doc.name}`}
                      >
                        <Download size={18} aria-hidden />
                      </a>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className={buttonClasses({ variant: "ghost", size: "icon", className: "text-red-600" })}
                        title="Elimina"
                        aria-label={`Elimina ${doc.name}`}
                      >
                        <Trash2 size={18} aria-hidden />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span>{formatDate(new Date(doc.uploadedAt))}</span>
                  </div>
                  
                  {doc.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">&quot;{doc.notes}&quot;</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {documents.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--color-sage)" }}>
                {documents.length}
              </div>
              <div className="text-sm text-gray-600">Documenti totali</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--color-sage)" }}>
                {documents.filter(d => d.category === "Preventivo").length}
              </div>
              <div className="text-sm text-gray-600">Preventivi</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--color-sage)" }}>
                {documents.filter(d => d.category === "Contratto").length}
              </div>
              <div className="text-sm text-gray-600">Contratti</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--color-sage)" }}>
                {(documents.reduce((sum, d) => sum + d.fileSize, 0) / (1024 * 1024)).toFixed(1)} MB
              </div>
              <div className="text-sm text-gray-600">Spazio usato</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
