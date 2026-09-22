export const runtime = "nodejs";

import { apiSecurityErrorResponse, parseUuid, requireEventAccess } from "@/lib/apiSecurity";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

type AssignmentInput = { guestId?: unknown; seatNumber?: unknown };
type TableInput = {
  id?: unknown;
  tableNumber?: unknown;
  tableName?: unknown;
  tableType?: unknown;
  totalSeats?: unknown;
  notes?: unknown;
  assignedGuests?: unknown;
};
type AssignmentRow = {
  id: string;
  guest_id: string;
  seat_number: number | null;
};
type TableRow = {
  id: string;
  table_number: number;
  table_name: string | null;
  table_type: string;
  total_seats: number;
  notes: string | null;
  table_assignments: AssignmentRow[] | null;
};
type GuestRow = {
  id: string;
  name: string;
  guest_type: string;
  exclude_from_family_table: boolean | null;
  family_group_id: string | null;
  family_groups: { family_name: string } | { family_name: string }[] | null;
  attending: boolean | null;
};

function relationOne<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] || null : value;
}

class TablePlanError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

function integer(value: unknown, min: number, max: number, code: string) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) throw new TablePlanError(code);
  return parsed;
}

function text(value: unknown, max: number, code: string, required = false) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new TablePlanError(code);
    return null;
  }
  if (typeof value !== "string" || value.trim().length > max) throw new TablePlanError(code);
  if (required && !value.trim()) throw new TablePlanError(code);
  return value.trim() || null;
}

function validatePlan(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new TablePlanError("TABLE_PLAN_INVALID");
  const payload = body as { tables?: unknown; replace?: unknown };
  if (!Array.isArray(payload.tables) || payload.tables.length > 200) throw new TablePlanError("TABLE_PLAN_INVALID");

  const tableIds = new Set<string>();
  const tableNumbers = new Set<number>();
  const guestIds = new Set<string>();
  const tables = payload.tables.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new TablePlanError("TABLE_INVALID");
    const table = raw as TableInput;
    const id = table.id ? parseUuid(table.id, "INVALID_TABLE_ID") : undefined;
    if (id && tableIds.has(id)) throw new TablePlanError("DUPLICATE_TABLE_ID");
    if (id) tableIds.add(id);

    const tableNumber = integer(table.tableNumber, 1, 10_000, "TABLE_NUMBER_INVALID");
    if (tableNumbers.has(tableNumber)) throw new TablePlanError("DUPLICATE_TABLE_NUMBER");
    tableNumbers.add(tableNumber);
    const totalSeats = integer(table.totalSeats, 1, 100, "TABLE_CAPACITY_INVALID");
    const assigned = table.assignedGuests === undefined ? [] : table.assignedGuests;
    if (!Array.isArray(assigned) || assigned.length > totalSeats) throw new TablePlanError("TABLE_CAPACITY_EXCEEDED");
    const seatNumbers = new Set<number>();
    const assignedGuests = assigned.map((rawAssignment, index) => {
      if (!rawAssignment || typeof rawAssignment !== "object" || Array.isArray(rawAssignment)) throw new TablePlanError("TABLE_ASSIGNMENT_INVALID");
      const assignment = rawAssignment as AssignmentInput;
      const guestId = parseUuid(assignment.guestId, "INVALID_GUEST_ID");
      if (guestIds.has(guestId)) throw new TablePlanError("GUEST_ALREADY_ASSIGNED");
      guestIds.add(guestId);
      const seatNumber = assignment.seatNumber === undefined || assignment.seatNumber === null
        ? index + 1
        : integer(assignment.seatNumber, 1, totalSeats, "TABLE_SEAT_INVALID");
      if (seatNumbers.has(seatNumber)) throw new TablePlanError("TABLE_SEAT_DUPLICATE");
      seatNumbers.add(seatNumber);
      return { guestId, seatNumber };
    });

    return {
      ...(id ? { id } : {}),
      tableNumber,
      tableName: text(table.tableName, 255, "TABLE_NAME_INVALID"),
      tableType: text(table.tableType, 50, "TABLE_TYPE_INVALID") || "round",
      totalSeats,
      notes: text(table.notes, 2000, "TABLE_NOTES_INVALID"),
      assignedGuests,
    };
  });
  return { tables, replace: payload.replace === true };
}

function validationResponse(error: unknown) {
  if (error instanceof TablePlanError) return NextResponse.json({ error: error.code }, { status: 400 });
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const db = getServiceClient();
    const [{ data: rawTables, error: tablesError }, { data: rawGuests, error: guestsError }] = await Promise.all([
      db.from("tables").select(`
        id, table_number, table_name, table_type, total_seats, notes,
        table_assignments (id, guest_id, seat_number)
      `).eq("event_id", currentEvent.eventId).order("table_number"),
      db.from("guests").select(`
        id, name, guest_type, attending, exclude_from_family_table, family_group_id,
        family_groups!guests_family_group_id_fkey (family_name)
      `).eq("event_id", currentEvent.eventId).order("name"),
    ]);

    if (tablesError || guestsError) {
      logger.error("TABLES_READ_FAILED", { tables: tablesError?.code, guests: guestsError?.code });
      return NextResponse.json({ error: "TABLES_READ_FAILED" }, { status: 500 });
    }

    const guests = (rawGuests || []) as GuestRow[];
    const sameEventGuestNames = new Map(guests.map((guest) => [guest.id, guest.name]));
    const tables = ((rawTables || []) as TableRow[]).map((table) => ({
      id: table.id,
      tableNumber: table.table_number,
      tableName: table.table_name,
      tableType: table.table_type,
      totalSeats: table.total_seats,
      notes: table.notes || "",
      assignedGuests: (table.table_assignments || []).map((assignment) => ({
        id: assignment.id,
        guestId: assignment.guest_id,
        guestName: sameEventGuestNames.get(assignment.guest_id) || null,
        seatNumber: assignment.seat_number,
      })),
    }));
    const assigned = new Set(tables.flatMap((table) => table.assignedGuests.map((guest) => guest.guestId)));
    const availableGuests = guests
      .filter((guest) => guest.attending === true && !assigned.has(guest.id))
      .map((guest) => ({
        id: guest.id,
        name: guest.name,
        guestType: guest.guest_type,
        excludeFromFamilyTable: guest.exclude_from_family_table === true,
        familyGroupId: guest.family_group_id,
        familyName: relationOne(guest.family_groups)?.family_name || null,
      }));
    return NextResponse.json({ tables, availableGuests });
  } catch (error) {
    return apiSecurityErrorResponse(error, "TABLES_READ_FAILED");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const plan = validatePlan(await req.json());
    const { data, error } = await getServiceClient().rpc("save_event_table_plan", {
      p_event_id: currentEvent.eventId,
      p_actor_id: userId,
      p_tables: plan.tables,
      p_replace: plan.replace,
    });
    if (error) {
      logger.error("TABLES_SAVE_FAILED", { code: error.code, message: error.message });
      const status = error.code === "23505" || error.code === "23514" ? 409 : 500;
      return NextResponse.json({ error: status === 409 ? "TABLE_SAVE_CONFLICT" : "TABLES_SAVE_FAILED" }, { status });
    }
    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    const invalid = validationResponse(error);
    return invalid || apiSecurityErrorResponse(error, "TABLES_SAVE_FAILED");
  }
}

export const PUT = POST;
export const PATCH = POST;

export async function DELETE(req: NextRequest) {
  try {
    const { currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const tableId = parseUuid(new URL(req.url).searchParams.get("id"), "INVALID_TABLE_ID");
    const { data, error } = await getServiceClient()
      .from("tables")
      .delete()
      .eq("id", tableId)
      .eq("event_id", currentEvent.eventId)
      .select("id")
      .maybeSingle();
    if (error) {
      logger.error("TABLE_DELETE_FAILED", { code: error.code });
      return NextResponse.json({ error: "TABLE_DELETE_FAILED" }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: "TABLE_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiSecurityErrorResponse(error, "TABLE_DELETE_FAILED");
  }
}
