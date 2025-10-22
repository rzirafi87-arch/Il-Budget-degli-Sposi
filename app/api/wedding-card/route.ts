import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = getServiceClient();
    
    // Get current user's event
    const { data: eventData } = await supabase
      .from('events')
      .select('id')
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

    return NextResponse.json({ config });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
