import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

type CreateEventBody = {
  type_slug?: string;
  type_id?: number;
  title?: string;
  is_public?: boolean;
};

function generatePublicId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as CreateEventBody;

    // 1) Auth: read current user via Authorization: Bearer <JWT>
    const db = getServiceClient();
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];
    if (!jwt) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    const { data: authData, error: authErr } = await db.auth.getUser(jwt);
    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "Token non valido" }, { status: 401 });
    }
    const userId = authData.user.id as string;

    // 2) Resolve type_id
    // db già istanziato
    let typeId = body.type_id;
    if (!typeId && body.type_slug) {
      const { data: trows, error: terr } = await db
        .from("event_types")
        .select("id")
        .eq("slug", body.type_slug)
        .limit(1);
      if (terr) {
        return NextResponse.json({ error: terr.message }, { status: 500 });
      }
      if (!trows || trows.length === 0) {
        return NextResponse.json({ error: "Tipo evento non trovato" }, { status: 400 });
      }
      typeId = trows[0].id as number;
    }
    if (!typeId) {
      return NextResponse.json({ error: "Specificare type_slug o type_id" }, { status: 400 });
    }

    const isPublic = Boolean(body.is_public);
    const title = body.title?.trim() || null;

    // 3) Create event (service role)
    let publicId = generatePublicId();
    let evtId: string | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data: inserted, error: evtErr } = await db
        .from("events")
        .insert({
          owner_id: userId,
          type_id: typeId,
          title,
          is_public: isPublic,
          public_id: publicId,
        })
        .select("id, public_id")
        .single();

      if (!evtErr && inserted) {
        evtId = inserted.id as string;
        publicId = inserted.public_id as string;
        break;
      }
      const dup = evtErr?.message && /duplicate key value violates unique constraint/i.test(evtErr.message);
      if (dup) {
        publicId = generatePublicId();
        continue;
      }
      return NextResponse.json({ error: evtErr?.message ?? "Errore creazione evento" }, { status: 500 });
    }

    if (!evtId) {
      return NextResponse.json({ error: "Impossibile creare l'evento" }, { status: 500 });
    }

    // 4) Ensure owner membership (best-effort)
        try {
      await db
        .from("event_members")
        .insert({ event_id: evtId, user_id: userId, role: "owner" });
    } catch {
      // best-effort: ignora eventuali errori di membership
    }

    return NextResponse.json({ event: { id: evtId, public_id: publicId } }, { status: 200 });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("EVENT-CORE/NEW Uncaught:", error);
    return NextResponse.json({ error: error?.message || "Unexpected" }, { status: 500 });
  }
}



