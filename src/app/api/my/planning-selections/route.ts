import { getServiceClient } from "@/lib/supabaseServer";
import { planningSelectionErrorResponse, requirePlanningSelectionAccess } from "@/lib/planningSelectionAuthorization";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "read");
    const db = getServiceClient();
    const event = { id: currentEvent.eventId, event_type: currentEvent.eventType };
    const [{ data: savedChurch, error: churchError }, { data: savedLocations, error: locationError }, { data: savedSuppliers, error: supplierError }] = await Promise.all([
      db.from("saved_churches").select("church_id,churches(name)").eq("event_id", event.id).eq("selected", true).maybeSingle(),
      db.from("saved_locations").select("location_id,location_role,locations(name)").eq("event_id", event.id).eq("selected", true).order("location_role"),
      db.from("saved_suppliers").select("id,supplier_id,status,suppliers(name)").eq("event_id", event.id).eq("status", "SELECTED").order("created_at"),
    ]);
    if (churchError || locationError || supplierError) return NextResponse.json({ error: "PLANNING_SELECTION_READ_FAILED" }, { status: 500 });
    // Both queries are constrained to selected=true, so the canonical state is
    // known without loading or reinterpreting any additional stored fields.
    const church = savedChurch ? { ...savedChurch, planning_state: "selected" as const } : null;
    const locations = (savedLocations || []).map((row) => ({ ...row, planning_state: "selected" as const }));
    const suppliers = (savedSuppliers || []).map((row) => ({ ...row, planning_state: "selected" as const }));
    const locationRoles = ["reception", "ceremony", "accommodation", "party", "other"] as const;
    const locationsByRole = Object.fromEntries(locationRoles.map((role) => [
      role,
      locations.some((row) => row.location_role === role) ? "selected" : "undecided",
    ]));
    return NextResponse.json({
      church,
      locations,
      suppliers,
      decision: {
        church: church ? "selected" : "undecided",
        locationsByRole,
        suppliers: suppliers.length > 0 ? "selected" : "undecided",
      },
      eventType: event.event_type,
    });
  } catch (error) { return planningSelectionErrorResponse(error); }
}
