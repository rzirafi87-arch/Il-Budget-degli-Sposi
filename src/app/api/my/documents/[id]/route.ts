export const runtime = "nodejs";

import {
  apiSecurityErrorResponse,
  parseUuid,
  requireEventAccess,
  requireEventResource,
} from "@/lib/apiSecurity";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

const DOCUMENT_BUCKET = "event-documents";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const { id } = await context.params;
    const documentId = parseUuid(id, "INVALID_DOCUMENT_ID");
    const resource = await requireEventResource(
      "event_documents",
      documentId,
      currentEvent.eventId,
      "id,object_path",
    );
    const objectPath = String(resource.object_path || "");
    if (!objectPath.startsWith(`${currentEvent.eventId}/`)) {
      return NextResponse.json({ error: "DOCUMENT_PATH_INVALID" }, { status: 500 });
    }

    const db = getServiceClient();
    const storageDelete = await db.storage.from(DOCUMENT_BUCKET).remove([objectPath]);
    if (storageDelete.error) {
      logger.error("EVENT_DOCUMENT_STORAGE_DELETE_FAILED", {
        id: documentId,
        message: storageDelete.error.message,
      });
      return NextResponse.json({ error: "EVENT_DOCUMENT_DELETE_FAILED" }, { status: 500 });
    }

    const { data, error } = await db
      .from("event_documents")
      .delete()
      .eq("id", documentId)
      .eq("event_id", currentEvent.eventId)
      .select("id")
      .maybeSingle();

    if (error) {
      logger.error("EVENT_DOCUMENT_METADATA_DELETE_FAILED", { id: documentId, code: error.code });
      return NextResponse.json({ error: "EVENT_DOCUMENT_DELETE_FAILED" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "DOCUMENT_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiSecurityErrorResponse(error, "EVENT_DOCUMENT_DELETE_FAILED");
  }
}
