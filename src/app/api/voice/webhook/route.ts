import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWhatsApp } from '@/lib/whatsapp/send';

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

      const startedAt = call?.startedAt ? new Date(call.startedAt).getTime() : 0;
      const endedAt   = call?.endedAt   ? new Date(call.endedAt).getTime()   : 0;
      const durationSeconds = startedAt && endedAt ? Math.round((endedAt - startedAt) / 1000) : 0;

      const outcome      = detectOutcome(message);
      const transcript   = message.transcript ?? null;
      const summary      = message.analysis?.summary ?? null;
      const recordingUrl = call?.recordingUrl ?? null;
      const callerNumber = call?.customer?.number ?? '';

      // 1. Log call to Supabase
      await supabase.from('voice_calls').insert({
        agent_id:            agentId,
        vapi_call_id:        call?.id ?? null,
        caller_number:       callerNumber,
        duration_seconds:    durationSeconds,
        transcript,
        summary,
        recording_url:       recordingUrl,
        outcome,
        lead_created:        outcome === 'lead_created',
        appointment_created: outcome === 'appointment_booked',
        order_created:       outcome === 'order_taken',
        transferred:         outcome === 'transferred',
        cost_usd:            call?.cost ?? null,
      });

      // 2. Update agent minutes
      const minutes = Math.ceil(durationSeconds / 60) || 1;
      await supabase.rpc('increment_minutes_used', { agent_id: agentId, minutes });

      // 3. Send WhatsApp summary to business owner
      const { data: agent } = await supabase
        .from('voice_agents')
        .select('business_name, transfer_whatsapp')
        .eq('id', agentId)
        .single();

      if (agent?.transfer_whatsapp) {
        const outcomeLabels: Record<string, string> = {
          lead_created:       '🎯 Nuevo lead',
          appointment_booked: '📅 Cita agendada',
          order_taken:        '🛒 Pedido tomado',
          transferred:        '📞 Transferida',
          info_provided:      'ℹ️ Info proporcionada',
          escalated_whatsapp: '💬 Escalada a WhatsApp',
          other:              '📱 Llamada terminada',
        };

        const mins = Math.ceil(durationSeconds / 60);
        const msg = [
          `${outcomeLabels[outcome] ?? '📱 Llamada'} — *${agent.business_name}*`,
          callerNumber ? `📞 ${callerNumber}` : null,
          `⏱ ${mins} min`,
          summary ? `\n📝 ${summary}` : null,
        ].filter(Boolean).join('\n');

        await sendWhatsApp(agent.transfer_whatsapp, msg);
      }

      break;
    }

    default:
      break;
  }

  return NextResponse.json({ ok: true });
}

function detectOutcome(message: any): string {
  const toolCalls: string[] = (message.toolCallResults ?? []).map((r: any) => r.name ?? '');

  if (toolCalls.includes('crear_lead'))                  return 'lead_created';
  if (toolCalls.includes('agendar_cita'))                return 'appointment_booked';
  if (toolCalls.includes('registrar_pedido'))            return 'order_taken';
  if (toolCalls.includes('notificar_transferencia'))     return 'transferred';
  if (toolCalls.includes('enviar_whatsapp_escalacion'))  return 'escalated_whatsapp';

  const transcript = (message.transcript ?? '').toLowerCase();
  if (transcript.length > 50) return 'info_provided';
  return 'other';
}
