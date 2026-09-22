export const runtime = "nodejs";

import { apiSecurityErrorResponse, parseUuid, requireEventAccess } from "@/lib/apiSecurity";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

const PRIORITIES = new Set(["high", "medium", "low"]);
const STATUSES = new Set(["wanted", "received", "archived"]);

type GiftListInput = {
  id?: unknown;
  type?: unknown;
  name?: unknown;
  description?: unknown;
  url?: unknown;
  targetAmount?: unknown;
  price?: unknown;
  priority?: unknown;
  status?: unknown;
  note?: unknown;
  notes?: unknown;
};

type GiftListRow = {
  id: string;
  type: string;
  name: string;
  description: string | null;
  url: string | null;
  target_amount: number | string | null;
  priority: "high" | "medium" | "low";
  status: "wanted" | "received" | "archived";
  note: string | null;
  created_at: string;
  updated_at: string;
};

class GiftValidationError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

function optionalText(value: unknown, maxLength: number, code: string) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.trim().length > maxLength) {
    throw new GiftValidationError(code);
  }
  return value.trim();
}

function validateUrl(value: unknown) {
  const text = optionalText(value, 2048, "GIFT_URL_INVALID");
  if (!text) return null;
  try {
    const parsed = new URL(text);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("unsupported protocol");
    }
    return parsed.toString();
  } catch {
    throw new GiftValidationError("GIFT_URL_INVALID");
  }
}

function validateAmount(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 9_999_999_999.99) {
    throw new GiftValidationError("GIFT_TARGET_AMOUNT_INVALID");
  }
  return Math.round(amount * 100) / 100;
}

function validateGift(body: GiftListInput) {
  const type = optionalText(body.type, 80, "GIFT_TYPE_INVALID");
  const name = optionalText(body.name, 160, "GIFT_NAME_INVALID");
  if (!type) throw new GiftValidationError("GIFT_TYPE_REQUIRED");
  if (!name) throw new GiftValidationError("GIFT_NAME_REQUIRED");

  const priority = typeof body.priority === "string" ? body.priority : "medium";
  const status = typeof body.status === "string" ? body.status : "wanted";
  if (!PRIORITIES.has(priority)) throw new GiftValidationError("GIFT_PRIORITY_INVALID");
  if (!STATUSES.has(status)) throw new GiftValidationError("GIFT_STATUS_INVALID");

  return {
    type,
    name,
    description: optionalText(body.description, 2000, "GIFT_DESCRIPTION_INVALID"),
    url: validateUrl(body.url),
    target_amount: validateAmount(body.targetAmount ?? body.price),
    priority,
    status,
    note: optionalText(body.note ?? body.notes, 2000, "GIFT_NOTE_INVALID"),
  };
}

type GiftValues = ReturnType<typeof validateGift>;

function validateGiftPatch(body: GiftListInput): Partial<GiftValues> {
  const values: Partial<GiftValues> = {};
  if (body.type !== undefined) {
    const type = optionalText(body.type, 80, "GIFT_TYPE_INVALID");
    if (!type) throw new GiftValidationError("GIFT_TYPE_REQUIRED");
    values.type = type;
  }
  if (body.name !== undefined) {
    const name = optionalText(body.name, 160, "GIFT_NAME_INVALID");
    if (!name) throw new GiftValidationError("GIFT_NAME_REQUIRED");
    values.name = name;
  }
  if (body.description !== undefined) values.description = optionalText(body.description, 2000, "GIFT_DESCRIPTION_INVALID");
  if (body.url !== undefined) values.url = validateUrl(body.url);
  if (body.targetAmount !== undefined || body.price !== undefined) values.target_amount = validateAmount(body.targetAmount ?? body.price);
  if (body.priority !== undefined) {
    if (typeof body.priority !== "string" || !PRIORITIES.has(body.priority)) throw new GiftValidationError("GIFT_PRIORITY_INVALID");
    values.priority = body.priority;
  }
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !STATUSES.has(body.status)) throw new GiftValidationError("GIFT_STATUS_INVALID");
    values.status = body.status;
  }
  if (body.note !== undefined || body.notes !== undefined) values.note = optionalText(body.note ?? body.notes, 2000, "GIFT_NOTE_INVALID");
  if (Object.keys(values).length === 0) throw new GiftValidationError("GIFT_PATCH_EMPTY");
  return values;
}

function serializeGift(row: GiftListRow) {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    description: row.description,
    url: row.url,
    targetAmount: row.target_amount === null ? null : Number(row.target_amount),
    price: row.target_amount === null ? null : Number(row.target_amount),
    priority: row.priority,
    status: row.status,
    notes: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validationResponse(error: unknown) {
  if (error instanceof GiftValidationError) {
    return NextResponse.json({ error: error.code }, { status: 400 });
  }
  return null;
}

async function readBody(req: NextRequest): Promise<GiftListInput> {
  const body = await req.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new GiftValidationError("INVALID_JSON");
  }
  return body as GiftListInput;
}

const projection = "id,type,name,description,url,target_amount,priority,status,note,created_at,updated_at";

export async function GET(req: NextRequest) {
  try {
    const { currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const { data, error } = await getServiceClient()
      .from("gift_list_items")
      .select(projection)
      .eq("event_id", currentEvent.eventId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("GIFT_LIST_READ_FAILED", { code: error.code });
      return NextResponse.json({ error: "GIFT_LIST_READ_FAILED" }, { status: 500 });
    }
    return NextResponse.json({ items: ((data || []) as GiftListRow[]).map(serializeGift) });
  } catch (error) {
    return apiSecurityErrorResponse(error, "GIFT_LIST_READ_FAILED");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const values = validateGift(await readBody(req));
    const { data, error } = await getServiceClient()
      .from("gift_list_items")
      .insert({ ...values, event_id: currentEvent.eventId, created_by: userId })
      .select(projection)
      .single();

    if (error || !data) {
      logger.error("GIFT_LIST_CREATE_FAILED", { code: error?.code });
      return NextResponse.json({ error: "GIFT_LIST_CREATE_FAILED" }, { status: 500 });
    }
    return NextResponse.json({ item: serializeGift(data as GiftListRow) }, { status: 201 });
  } catch (error) {
    const invalid = validationResponse(error);
    return invalid || apiSecurityErrorResponse(error, "GIFT_LIST_CREATE_FAILED");
  }
}

async function update(req: NextRequest, partial: boolean) {
  try {
    const { currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const body = await readBody(req);
    const itemId = parseUuid(body.id, "INVALID_GIFT_ITEM_ID");
    const values = partial ? validateGiftPatch(body) : validateGift(body);
    const { data, error } = await getServiceClient()
      .from("gift_list_items")
      .update(values)
      .eq("id", itemId)
      .eq("event_id", currentEvent.eventId)
      .select(projection)
      .maybeSingle();

    if (error) {
      logger.error("GIFT_LIST_UPDATE_FAILED", { code: error.code });
      return NextResponse.json({ error: "GIFT_LIST_UPDATE_FAILED" }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: "GIFT_ITEM_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ item: serializeGift(data as GiftListRow) });
  } catch (error) {
    const invalid = validationResponse(error);
    return invalid || apiSecurityErrorResponse(error, "GIFT_LIST_UPDATE_FAILED");
  }
}

export async function PUT(req: NextRequest) {
  return update(req, false);
}

export async function PATCH(req: NextRequest) {
  return update(req, true);
}

export async function DELETE(req: NextRequest) {
  try {
    const { currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const itemId = parseUuid(new URL(req.url).searchParams.get("id"), "INVALID_GIFT_ITEM_ID");
    const { data, error } = await getServiceClient()
      .from("gift_list_items")
      .delete()
      .eq("id", itemId)
      .eq("event_id", currentEvent.eventId)
      .select("id")
      .maybeSingle();

    if (error) {
      logger.error("GIFT_LIST_DELETE_FAILED", { code: error.code });
      return NextResponse.json({ error: "GIFT_LIST_DELETE_FAILED" }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: "GIFT_ITEM_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiSecurityErrorResponse(error, "GIFT_LIST_DELETE_FAILED");
  }
}
