export const runtime = "nodejs";

import { randomUUID } from "node:crypto";
import { apiSecurityErrorResponse, requireEventAccess } from "@/lib/apiSecurity";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

const DOCUMENT_BUCKET = "event-documents";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const EVENT_QUOTA_BYTES = 100 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const ALLOWED_CATEGORIES = new Set([
  "quote",
  "contract",
  "invoice",
  "receipt",
  "generic",
  "certificate",
  "license",
]);

type EventDocumentRow = {
  id: string;
  original_name: string;
  category: string;
  mime_type: string;
  file_size: number | string;
  notes: string | null;
  created_at: string;
};

function serializeDocument(row: EventDocumentRow) {
  return {
    id: row.id,
    name: row.original_name,
    category: row.category,
    mimeType: row.mime_type,
    fileSize: Number(row.file_size),
    notes: row.notes,
    uploadedAt: row.created_at,
  };
}

function safeStorageName(name: string) {
  const cleaned = name
    .normalize("NFKC")
    .replace(/[\\/\u0000-\u001f\u007f]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return cleaned || "document";
}

export async function GET(req: NextRequest) {
  try {
    const { currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const { data, error } = await getServiceClient()
      .from("event_documents")
      .select("id,original_name,category,mime_type,file_size,notes,created_at")
      .eq("event_id", currentEvent.eventId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("EVENT_DOCUMENTS_READ_FAILED", { code: error.code });
      return NextResponse.json({ error: "EVENT_DOCUMENTS_READ_FAILED" }, { status: 500 });
    }

    return NextResponse.json({
      documents: ((data || []) as EventDocumentRow[]).map(serializeDocument),
      limits: { maxFileBytes: MAX_FILE_BYTES, eventQuotaBytes: EVENT_QUOTA_BYTES },
    });
  } catch (error) {
    return apiSecurityErrorResponse(error, "EVENT_DOCUMENTS_READ_FAILED");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const form = await req.formData();
    const value = form.get("file");
    const categoryValue = String(form.get("category") || "generic");
    const notesValue = String(form.get("notes") || "").trim();

    if (!(value instanceof File)) {
      return NextResponse.json({ error: "DOCUMENT_FILE_REQUIRED" }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.has(value.type)) {
      return NextResponse.json({ error: "DOCUMENT_TYPE_NOT_ALLOWED" }, { status: 415 });
    }
    if (value.size <= 0 || value.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "DOCUMENT_FILE_TOO_LARGE" }, { status: 413 });
    }
    if (!ALLOWED_CATEGORIES.has(categoryValue)) {
      return NextResponse.json({ error: "DOCUMENT_CATEGORY_INVALID" }, { status: 400 });
    }
    if (value.name.trim().length === 0 || value.name.length > 255) {
      return NextResponse.json({ error: "DOCUMENT_NAME_INVALID" }, { status: 400 });
    }
    if (notesValue.length > 2000) {
      return NextResponse.json({ error: "DOCUMENT_NOTES_TOO_LONG" }, { status: 400 });
    }

    const db = getServiceClient();
    const { data: sizes, error: quotaError } = await db
      .from("event_documents")
      .select("file_size")
      .eq("event_id", currentEvent.eventId);

    if (quotaError) {
      logger.error("EVENT_DOCUMENT_QUOTA_READ_FAILED", { code: quotaError.code });
      return NextResponse.json({ error: "EVENT_DOCUMENT_UPLOAD_FAILED" }, { status: 500 });
    }

    const usedBytes = (sizes || []).reduce(
      (sum, row) => sum + Number((row as { file_size?: number | string }).file_size || 0),
      0,
    );
    if (usedBytes + value.size > EVENT_QUOTA_BYTES) {
      return NextResponse.json({ error: "EVENT_DOCUMENT_QUOTA_EXCEEDED" }, { status: 413 });
    }

    const documentId = randomUUID();
    const objectPath = `${currentEvent.eventId}/${documentId}/${safeStorageName(value.name)}`;
    const bytes = new Uint8Array(await value.arrayBuffer());
    const { error: uploadError } = await db.storage
      .from(DOCUMENT_BUCKET)
      .upload(objectPath, bytes, {
        contentType: value.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      logger.error("EVENT_DOCUMENT_STORAGE_UPLOAD_FAILED", { message: uploadError.message });
      return NextResponse.json({ error: "EVENT_DOCUMENT_UPLOAD_FAILED" }, { status: 500 });
    }

    const { data: row, error: insertError } = await db
      .from("event_documents")
      .insert({
        id: documentId,
        event_id: currentEvent.eventId,
        created_by: userId,
        original_name: value.name.trim(),
        object_path: objectPath,
        category: categoryValue,
        mime_type: value.type,
        file_size: value.size,
        notes: notesValue || null,
      })
      .select("id,original_name,category,mime_type,file_size,notes,created_at")
      .single();

    if (insertError || !row) {
      const cleanup = await db.storage.from(DOCUMENT_BUCKET).remove([objectPath]);
      if (cleanup.error) {
        logger.error("EVENT_DOCUMENT_ORPHAN_CLEANUP_FAILED", {
          path: objectPath,
          message: cleanup.error.message,
        });
      }
      logger.error("EVENT_DOCUMENT_METADATA_INSERT_FAILED", { code: insertError?.code });
      return NextResponse.json({ error: "EVENT_DOCUMENT_UPLOAD_FAILED" }, { status: 500 });
    }

    return NextResponse.json({ document: serializeDocument(row as EventDocumentRow) }, { status: 201 });
  } catch (error) {
    return apiSecurityErrorResponse(error, "EVENT_DOCUMENT_UPLOAD_FAILED");
  }
}
