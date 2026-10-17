export const runtime = "nodejs";

import {
  apiSecurityErrorResponse,
  parseUuid,
  requireEventAccess,
} from "@/lib/apiSecurity";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

const DOCUMENT_BUCKET = "event-documents";

type DocumentDeleteOperation = {
  operationId?: string;
  documentId: string;
  objectPath?: string;
  status: "pending_storage" | "completed" | "not_found";
};

function pendingDeleteResponse() {
  return NextResponse.json({
    error: "EVENT_DOCUMENT_DELETE_PENDING",
    deletionPending: true,
    retryable: true,
  }, { status: 503 });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const { id } = await context.params;
    const documentId = parseUuid(id, "INVALID_DOCUMENT_ID");
    const db = getServiceClient();
    const begun = await db.rpc("begin_event_document_delete", {
      p_event_id: currentEvent.eventId,
      p_actor_id: userId,
      p_document_id: documentId,
    });
    if (begun.error || !begun.data) {
      logger.error("EVENT_DOCUMENT_DELETE_BEGIN_FAILED", {
        id: documentId,
        code: begun.error?.code,
      });
      if (begun.error?.message?.includes("DOCUMENT_EVENT_MISMATCH")) {
        return NextResponse.json({ error: "DOCUMENT_NOT_FOUND" }, { status: 404 });
      }
      if (begun.error?.code === "42501") {
        return NextResponse.json({ error: "EVENT_ACCESS_DENIED" }, { status: 403 });
      }
      return NextResponse.json({ error: "EVENT_DOCUMENT_DELETE_FAILED" }, { status: 500 });
    }

    const operation = begun.data as unknown as DocumentDeleteOperation;
    if (operation.status === "not_found") {
      return NextResponse.json({ error: "DOCUMENT_NOT_FOUND" }, { status: 404 });
    }
    if (operation.status === "completed") {
      return NextResponse.json({ success: true, idempotent: true });
    }

    const objectPath = String(operation.objectPath || "");
    if (!objectPath.startsWith(`${currentEvent.eventId}/`)) {
      logger.error("EVENT_DOCUMENT_DELETE_PATH_INVALID", { id: documentId });
      return NextResponse.json({ error: "DOCUMENT_PATH_INVALID" }, { status: 500 });
    }
    if (!operation.operationId || operation.documentId !== documentId) {
      logger.error("EVENT_DOCUMENT_DELETE_OPERATION_INVALID", { id: documentId });
      return NextResponse.json({ error: "EVENT_DOCUMENT_DELETE_FAILED" }, { status: 500 });
    }

    const storageDelete = await db.storage.from(DOCUMENT_BUCKET).remove([objectPath]);
    if (storageDelete.error) {
      logger.error("EVENT_DOCUMENT_STORAGE_DELETE_FAILED", {
        id: documentId,
        message: storageDelete.error.message,
      });
      return pendingDeleteResponse();
    }

    const completed = await db.rpc("complete_event_document_delete", {
      p_event_id: currentEvent.eventId,
      p_actor_id: userId,
      p_operation_id: operation.operationId,
      p_document_id: documentId,
      p_object_path: objectPath,
    });
    if (completed.error || !completed.data) {
      logger.error("EVENT_DOCUMENT_DELETE_COMPLETE_FAILED", {
        id: documentId,
        code: completed.error?.code,
      });
      return pendingDeleteResponse();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiSecurityErrorResponse(error, "EVENT_DOCUMENT_DELETE_FAILED");
  }
}
