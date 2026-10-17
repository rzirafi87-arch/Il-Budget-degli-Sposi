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

export async function GET(
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
      "id,object_path,original_name,deletion_state,mime_type",
    );
    if (resource.deletion_state !== "active") {
      return NextResponse.json({ error: "DOCUMENT_NOT_FOUND" }, { status: 404 });
    }
    const objectPath = String(resource.object_path || "");
    if (!objectPath.startsWith(`${currentEvent.eventId}/`) || objectPath.split("/").some((part) => !part || part === "." || part === "..") || /[\\\x00-\x1f\x7f]/.test(objectPath)) {
      return NextResponse.json({ error: "DOCUMENT_PATH_INVALID" }, { status: 500 });
    }

    const { data, error } = await getServiceClient().storage
      .from(DOCUMENT_BUCKET)
      .download(objectPath);

    if (error || !data) {
      logger.error("EVENT_DOCUMENT_DOWNLOAD_FAILED", {
        id: documentId,
        message: error?.message,
      });
      return NextResponse.json({ error: "EVENT_DOCUMENT_DOWNLOAD_FAILED" }, { status: 500 });
    }

    // Buffer the bounded (10 MB) object before the final authorization check.
    // No response bytes escape while Storage is being fetched.
    const body = await data.arrayBuffer();
    const latestAccess = await requireEventAccess(req, "owner-or-partner");
    if (latestAccess.currentEvent.eventId !== currentEvent.eventId) {
      return NextResponse.json({ error: "DOCUMENT_NOT_FOUND" }, { status: 404 });
    }
    const latest = await requireEventResource(
      "event_documents", documentId, currentEvent.eventId,
      "id,object_path,deletion_state",
    );
    if (latest.deletion_state !== "active" || latest.object_path !== objectPath) {
      return NextResponse.json({ error: "DOCUMENT_NOT_FOUND" }, { status: 404 });
    }
    const filename = String(resource.original_name || "document")
      .replace(/[\x00-\x1f\x7f-\x9f"\\/]/g, "_")
      .replace(/[\uD800-\uDFFF]/g, "_");
    const fallback = filename.replace(/[^\x20-\x7e]/g, "_");
    const encoded = encodeURIComponent(filename).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
    return new Response(body, {
      headers: {
        "Content-Type": String(resource.mime_type || data.type || "application/octet-stream"),
        "Content-Disposition": `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`,
        "Cache-Control": "private, no-store, max-age=0",
        "Pragma": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiSecurityErrorResponse(error, "EVENT_DOCUMENT_DOWNLOAD_FAILED");
  }
}
