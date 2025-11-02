import { requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser(req);
    const db = getServiceClient();

    const { id } = await params;

    // Elimina l'entrata (RLS policies si occuperanno della verifica proprietà)
    const { error: deleteError } = await db
      .from("incomes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      logger.error("INCOMES DELETE error", { error: deleteError });
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    logger.error("INCOMES DELETE uncaught", { message: err.message });
    return NextResponse.json({ error: err.message || "Unexpected" }, { status: 500 });
  }
}
