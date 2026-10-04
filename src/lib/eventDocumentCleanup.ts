import { getServiceClient } from "@/lib/supabaseServer";

// The event row and its ledgers survive every partial failure. The database
// cascade guard is the final check against uploads racing this cleanup.
export async function cleanupEventDocuments(eventId: string, actorId: string): Promise<boolean> {
  const db = getServiceClient();
  const bucket = db.storage.from("event-documents");
  const expired = await db.rpc("claim_expired_event_document_uploads", {
    p_event_id: eventId, p_actor_id: actorId, p_limit: 100,
  });
  if (expired.error || !Array.isArray(expired.data)) return false;
  for (const value of expired.data) {
    const reservation = value as { reservationId: string; objectPath: string };
    if (!reservation.objectPath.startsWith(`${eventId}/`)) return false;
    if ((await bucket.remove([reservation.objectPath])).error) return false;
    const completed = await db.rpc("complete_event_document_upload_cleanup", {
      p_event_id: eventId, p_actor_id: actorId,
      p_reservation_id: reservation.reservationId, p_object_path: reservation.objectPath,
    });
    if (completed.error) return false;
  }

  const documents = await db.from("event_documents").select("id").eq("event_id", eventId).limit(100);
  if (documents.error || !documents.data) return false;
  for (const document of documents.data) {
    const begun = await db.rpc("begin_event_document_delete", {
      p_event_id: eventId, p_actor_id: actorId, p_document_id: document.id,
    });
    if (begun.error || !begun.data) return false;
    const operation = begun.data as { status?: string; documentId?: string; operationId?: string; objectPath?: string };
    if (operation.status === "completed" || operation.status === "not_found") continue;
    if (operation.status !== "pending_storage" || operation.documentId !== document.id
      || !operation.operationId || !operation.objectPath?.startsWith(`${eventId}/`)) return false;
    if ((await bucket.remove([operation.objectPath])).error) return false;
    const completed = await db.rpc("complete_event_document_delete", {
      p_event_id: eventId, p_actor_id: actorId, p_document_id: document.id,
      p_operation_id: operation.operationId, p_object_path: operation.objectPath,
    });
    if (completed.error || !completed.data) return false;
  }
  if (documents.data.length === 100) return false; // bounded work; retry progresses

  // Include objects with no active metadata (e.g. a failed upload), walking
  // reservation subfolders through Storage rather than deleting SQL metadata.
  const folders = [eventId];
  for (let requests = 0; folders.length > 0 && requests < 100; requests++) {
    const prefix = folders.shift()!;
    const listed = await bucket.list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } });
    if (listed.error || !listed.data) return false;
    const paths: string[] = [];
    for (const object of listed.data) {
      if (!object.name || object.name.includes("/") || object.name === "." || object.name === "..") return false;
      const path = `${prefix}/${object.name}`;
      if (object.id) {
        // Reservations precede Storage writes and keep immutable paths. Check
        // both ledgers under the event lock after listing, including metadata
        // finalized since the initial document batch. Uncertainty is retryable.
        const untracked = await db.rpc("event_document_path_is_untracked", {
          p_event_id: eventId, p_actor_id: actorId, p_object_path: path,
        });
        if (untracked.error || untracked.data !== true) return false;
        paths.push(path);
      }
      else folders.push(path);
    }
    if (paths.length && (await bucket.remove(paths)).error) return false;
    if (listed.data.length === 1000) folders.push(prefix); // revisit after this batch
  }
  return folders.length === 0;
}
