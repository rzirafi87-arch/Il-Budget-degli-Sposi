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
const SIGNED_URL_TTL_SECONDS = 60;

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
      "id,object_path,original_name",
    );
    const objectPath = String(resource.object_path || "");
    if (!objectPath.startsWith(`${currentEvent.eventId}/`)) {
      return NextResponse.json({ error: "DOCUMENT_PATH_INVALID" }, { status: 500 });
    }

    const { data, error } = await getServiceClient().storage
      .from(DOCUMENT_BUCKET)
      .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS, {
        download: String(resource.original_name || "document"),
      });

    if (error || !data?.signedUrl) {
      logger.error("EVENT_DOCUMENT_SIGNED_URL_FAILED", {
        id: documentId,
        message: error?.message,
      });
      return NextResponse.json({ error: "EVENT_DOCUMENT_DOWNLOAD_FAILED" }, { status: 500 });
    }

    return NextResponse.json({
      url: data.signedUrl,
      expiresIn: SIGNED_URL_TTL_SECONDS,
    });
  } catch (error) {
    return apiSecurityErrorResponse(error, "EVENT_DOCUMENT_DOWNLOAD_FAILED");
  }
}
