/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
export const runtime = "nodejs";
import { getServiceClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = getServiceClient();
    
    // Get current user's event with wedding date
    const { data: eventData } = await supabase
      .from('events')
      .select('id, wedding_date, bride_email, groom_email')
      .limit(1)
      .single();

    if (!eventData) {
      return NextResponse.json({ config: null });
    }

    // Get wedding card configuration
    const { data: config, error } = await supabase
      .from('wedding_cards')
      .select('*')
      .eq('event_id', eventData.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching wedding card:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Se esiste la configurazione, usala; altrimenti crea una configurazione base con la data dell'evento
    const finalConfig = config || {
      bride_name: '',
      groom_name: '',
      wedding_date: eventData.wedding_date || '',
      church_name: '',
      church_address: '',
      location_name: '',
      location_address: '',
      iban: '',
      bank_name: '',
      ceremony_time: '',
      reception_time: '',
      font_family: 'Playfair Display',
      color_scheme: 'classic',
      template_style: 'elegant',
      custom_message: ''
    };

    return NextResponse.json({ config: finalConfig });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

      // Se la data matrimonio è presente nel body, aggiorna anche l'evento
      if (body.wedding_date) {
        await supabase
          .from('events')
          .update({ wedding_date: body.wedding_date })
          .eq('id', eventData.id);
      }

    // Upsert wedding card configuration
    const { data, error } = await supabase
      .from('wedding_cards')
      .upsert({
        event_id: eventData.id,
        ...body
      }, {
        onConflict: 'event_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving wedding card:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
