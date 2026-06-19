import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agent_id = searchParams.get('agent_id');

  const body = await req.json();
  const { identificador } = body.toolCallList?.[0]?.function?.arguments ?? body;

  if (!agent_id || !identificador) {
    return NextResponse.json({ error: 'agent_id e identificador requeridos' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Search by phone, name, or client ID in voice_calls history
  const { data: calls } = await supabase
    .from('voice_calls')
    .select('caller_number, summary, outcome, created_at')
    .eq('agent_id', agent_id)
    .or(`caller_number.ilike.%${identificador}%`)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!calls || calls.length === 0) {
    return NextResponse.json({
      result: 'No encontré registros previos de ese cliente. ¿Le puedo ayudar como cliente nuevo?',
      found: false,
    });
  }

  const lastCall = calls[0];
  const callCount = calls.length;
  const lastDate = new Date(lastCall.created_at).toLocaleDateString('es-MX', {
    timeZone: 'America/Monterrey',
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const summary = [
    `Cliente con ${callCount} llamada${callCount > 1 ? 's' : ''} registrada${callCount > 1 ? 's' : ''}.`,
    `Última llamada: ${lastDate}.`,
    lastCall.summary ? `Resumen: ${lastCall.summary}` : null,
  ].filter(Boolean).join(' ');

  return NextResponse.json({ result: summary, found: true, call_history: calls });
}
