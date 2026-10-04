export const runtime = "nodejs";

import { randomUUID } from "node:crypto";
import { apiSecurityErrorResponse, parseUuid, requireEventAccess } from "@/lib/apiSecurity";
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

type UploadReservation = {
  reservationId: string;
  documentId: string;
  objectPath: string;
  fileSize: number;
  status: "active" | "finalized";
  expiresAt: string;
};

type ExpiredReservation = { reservationId: string; objectPath: string };

function uploadErrorResponse(error: { code?: string; message?: string } | null) {
  const message = error?.message || "";
  if (message.includes("EVENT_DOCUMENT_QUOTA_EXCEEDED")) {
    return NextResponse.json({ error: "EVENT_DOCUMENT_QUOTA_EXCEEDED" }, { status: 413 });
  }
  if (message.includes("DOCUMENT_IDEMPOTENCY_CONFLICT")) {
    return NextResponse.json({ error: "DOCUMENT_IDEMPOTENCY_CONFLICT" }, { status: 409 });
  }
  if (message.includes("DOCUMENT_RESERVATION_CLEANUP_REQUIRED")) {
    return NextResponse.json({ error: "DOCUMENT_UPLOAD_RETRY_REQUIRED" }, { status: 409 });
  }
  if (error?.code === "42501") {
    return NextResponse.json({ error: "EVENT_ACCESS_DENIED" }, { status: 403 });
  }
  return NextResponse.json({ error: "EVENT_DOCUMENT_UPLOAD_FAILED" }, { status: 500 });
}

async function cleanupExpiredReservations(
  db: ReturnType<typeof getServiceClient>,
  eventId: string,
  userId: string,
) {
  const { data, error } = await db.rpc("claim_expired_event_document_uploads", {
    p_event_id: eventId,
    p_actor_id: userId,
    p_limit: 20,
  });
  if (error) {
    logger.warn("EVENT_DOCUMENT_EXPIRED_CLAIM_FAILED", { code: error.code });
    return;
  }

  for (const reservation of (Array.isArray(data) ? data : []) as ExpiredReservation[]) {
    const removal = await db.storage.from(DOCUMENT_BUCKET).remove([reservation.objectPath]);
    if (removal.error) {
      logger.error("EVENT_DOCUMENT_EXPIRED_OBJECT_CLEANUP_FAILED", {
        reservationId: reservation.reservationId,
        message: removal.error.message,
      });
      continue;
    }
    const completed = await db.rpc("complete_event_document_upload_cleanup", {
      p_event_id: eventId,
      p_actor_id: userId,
      p_reservation_id: reservation.reservationId,
      p_object_path: reservation.objectPath,
    });
    if (completed.error) {
      logger.error("EVENT_DOCUMENT_EXPIRED_CLOSE_FAILED", {
        reservationId: reservation.reservationId,
        code: completed.error.code,
      });
    }
  }
}

async function readDocumentById(
  db: ReturnType<typeof getServiceClient>,
  eventId: string,
  documentId: string,
) {
  return db
    .from("event_documents")
    .select("id,original_name,category,mime_type,file_size,notes,created_at")
    .eq("id", documentId)
    .eq("event_id", eventId)
    .eq("deletion_state", "active")
    .maybeSingle();
}

export async function GET(req: NextRequest) {
  try {
    const { currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const { data, error } = await getServiceClient()
      .from("event_documents")
      .select("id,original_name,category,mime_type,file_size,notes,created_at")
      .eq("event_id", currentEvent.eventId)
      .eq("deletion_state", "active")
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("EVENT_DOCUMENTS_READ_FAILED", { code: error.code });
      return NextResponse.json({ error: "EVENT_DOCUMENTS_READ_FAILED" }, { status: 500 });
    }

    const pending = await getServiceClient().from("event_documents")
      .select("id,original_name").eq("event_id", currentEvent.eventId)
      .eq("deletion_state", "pending_storage").order("created_at", { ascending: false });
    if (pending.error) return NextResponse.json({ error: "EVENT_DOCUMENTS_READ_FAILED" }, { status: 500 });

    return NextResponse.json({
      documents: ((data || []) as EventDocumentRow[]).map(serializeDocument),
      pendingDeletions: ((pending.data || []) as Array<{ id: string; original_name: string }>).map((row) => ({ id: row.id, name: row.original_name })),
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
    await cleanupExpiredReservations(db, currentEvent.eventId, userId);

    const requestIdempotencyKey = form.get("idempotencyKey")
      || req.headers?.get?.("idempotency-key")
      || randomUUID();
    const idempotencyKey = parseUuid(requestIdempotencyKey, "DOCUMENT_IDEMPOTENCY_KEY_INVALID");
    const { data: reservationData, error: reservationError } = await db.rpc(
      "reserve_event_document_upload",
      {
        p_event_id: currentEvent.eventId,
        p_actor_id: userId,
        p_idempotency_key: idempotencyKey,
        p_file_size: value.size,
        p_original_name: value.name.trim(),
        p_mime_type: value.type,
        p_category: categoryValue,
        p_notes: notesValue || null,
        p_ttl_seconds: 900,
      },
    );
    if (reservationError || !reservationData) {
      logger.warn("EVENT_DOCUMENT_RESERVATION_FAILED", { code: reservationError?.code });
      return uploadErrorResponse(reservationError);
    }
    const reservation = reservationData as unknown as UploadReservation;
    if (reservation.status === "finalized") {
      const existing = await readDocumentById(
        db,
        currentEvent.eventId,
        reservation.documentId,
      );
      if (existing.error || !existing.data) {
        logger.error("EVENT_DOCUMENT_IDEMPOTENT_READ_FAILED", { code: existing.error?.code });
        return NextResponse.json({ error: "EVENT_DOCUMENT_UPLOAD_FAILED" }, { status: 500 });
      }
      return NextResponse.json(
        { document: serializeDocument(existing.data as EventDocumentRow), idempotent: true },
        { status: 200 },
      );
    }

    const bytes = new Uint8Array(await value.arrayBuffer());
    const { error: uploadError } = await db.storage
      .from(DOCUMENT_BUCKET)
      .upload(reservation.objectPath, bytes, {
        contentType: value.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      const retryFinalize = await db.rpc("finalize_event_document_upload", {
        p_event_id: currentEvent.eventId,
        p_actor_id: userId,
        p_reservation_id: reservation.reservationId,
        p_object_path: reservation.objectPath,
        p_file_size: value.size,
      });
      if (!retryFinalize.error) {
        const existing = await readDocumentById(
          db,
          currentEvent.eventId,
          reservation.documentId,
        );
        if (!existing.error && existing.data) {
          return NextResponse.json(
            { document: serializeDocument(existing.data as EventDocumentRow), idempotent: true },
            { status: 200 },
          );
        }
      }

      logger.error("EVENT_DOCUMENT_STORAGE_UPLOAD_FAILED", { message: uploadError.message });
      // A lost finalization response may already have committed metadata.
      // Keep the immutable reservation/path for idempotent retry or expiry cleanup.
      return NextResponse.json({ error: "DOCUMENT_UPLOAD_RETRY_REQUIRED", retryable: true }, { status: 503 });
    }

    const finalizeArgs = {
      p_event_id: currentEvent.eventId,
      p_actor_id: userId,
      p_reservation_id: reservation.reservationId,
      p_object_path: reservation.objectPath,
      p_file_size: value.size,
    };
    let finalized = await db.rpc("finalize_event_document_upload", finalizeArgs);
    if (finalized.error) finalized = await db.rpc("finalize_event_document_upload", finalizeArgs);
    if (finalized.error) {
      logger.error("EVENT_DOCUMENT_FINALIZE_FAILED", { code: finalized.error.code });
      return NextResponse.json({ error: "DOCUMENT_UPLOAD_RETRY_REQUIRED", retryable: true }, { status: 503 });
    }

    const { data: row, error: readError } = await readDocumentById(
      db,
      currentEvent.eventId,
      reservation.documentId,
    );
    if (readError || !row) {
      logger.error("EVENT_DOCUMENT_FINAL_READ_FAILED", { code: readError?.code });
      return NextResponse.json({ error: "EVENT_DOCUMENT_UPLOAD_FAILED" }, { status: 500 });
    }

    return NextResponse.json(
      { document: serializeDocument(row as EventDocumentRow), idempotencyKey },
      { status: 201 },
    );
  } catch (error) {
    return apiSecurityErrorResponse(error, "EVENT_DOCUMENT_UPLOAD_FAILED");
  }
}
