import { requireUser } from "@/lib/apiAuth";
import { NextRequest, NextResponse } from 'next/server';
export const runtime = "nodejs";
import { requireServerCurrentEvent } from '@/lib/currentEvent';

// Per generare il PDF useremo una libreria esterna da chiamare lato client
// Questo endpoint restituisce i dati necessari per la generazione

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    const body = await request.json();

    await requireServerCurrentEvent(userId);

    // In futuro qui potremmo generare il PDF server-side con una libreria come PDFKit
    // Per ora restituiamo i dati per la generazione client-side

    return NextResponse.json({ 
      success: true, 
      message: 'PDF generation not implemented yet. Will be added in next iteration.',
      data: body 
    });

  } catch (err: unknown) {
    console.error('Unexpected error:', err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    const status = message === "Missing JWT" || message === "Invalid JWT" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
