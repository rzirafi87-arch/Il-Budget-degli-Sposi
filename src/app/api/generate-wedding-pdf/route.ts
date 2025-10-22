import { NextRequest, NextResponse } from 'next/server';
export const runtime = "nodejs";
import { getServiceClient } from '@/lib/supabaseServer';

// Per generare il PDF useremo una libreria esterna da chiamare lato client
// Questo endpoint restituisce i dati necessari per la generazione

export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const body = await request.json();

    // Get current user's event
    const { data: eventData } = await supabase
      .from('events')
      .select('id')
      .limit(1)
      .single();

    if (!eventData) {
      return NextResponse.json({ error: 'No event found' }, { status: 404 });
    }

    // In futuro qui potremmo generare il PDF server-side con una libreria come PDFKit
    // Per ora restituiamo i dati per la generazione client-side

    return NextResponse.json({ 
      success: true, 
      message: 'PDF generation not implemented yet. Will be added in next iteration.',
      data: body 
    });

  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
