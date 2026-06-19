import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Vapi sends all call lifecycle events here
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message } = body;

  if (!message) return NextResponse.json({ ok: true });

  const supabase = createAdminClient();

  switch (message.type) {
    case 'end-of-call-report': {
      const call = message.call;
      const agentId: string = call?.metadata?.agent_id ?? '';
      if (!agentId) break;

      const durationSeconds = Math.round((call?.endedAt - call?.startedAt) / 1000) || 0;
      const costUsd = call?.cost ?? null;

      const outcome = detectOutcome(message);

      await supabase.from('voice_calls').insert({
        agent_id:            agentId,
        vapi_call_id:        call?.id ?? null,
        caller_number:       call?.customer?.number ?? '',
        duration_seconds:    durationSeconds,
        transcript:          message.transcript ?? null,
        summary:             message.analysis?.summary ?? null,
        outcome,
        lead_created:        outcome === 'lead_created',
        appointment_created: outcome === 'appointment_booked',
        order_created:       outcome === 'order_taken',
        transferred:         outcome === 'transferred',
        cost_usd:            costUsd,
      });

      // Update minutes used for this agent
      const minutes = Math.ceil(durationSeconds / 60);
      await supabase.rpc('increment_minutes_used', {
        p_agent_id: agentId,
        p_minutes: minutes,
      });

      break;
    }

    case 'transcript':
    case 'hang':
    case 'speech-update':
    case 'status-update':
      // Future: stream transcripts or handle mid-call events
      break;

    default:
      break;
  }

  return NextResponse.json({ ok: true });
}

function detectOutcome(message: any): string {
  const transcript: string = (message.transcript ?? '').toLowerCase();
  const toolCalls: string[] = (message.toolCallResults ?? []).map(
    (r: any) => r.name ?? ''
  );

  if (toolCalls.includes('crear_lead'))           return 'lead_created';
  if (toolCalls.includes('agendar_cita'))         return 'appointment_booked';
  if (toolCalls.includes('registrar_pedido'))     return 'order_taken';
  if (toolCalls.includes('notificar_transferencia')) return 'transferred';
  if (toolCalls.includes('enviar_whatsapp_escalacion')) return 'escalated_whatsapp';
  if (transcript.includes('información'))         return 'info_provided';
  return 'other';
}
