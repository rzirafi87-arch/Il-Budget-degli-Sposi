import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";

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
  } catch (e: any) {
    logger.error("INCOMES DELETE uncaught", { message: e?.message });
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}
