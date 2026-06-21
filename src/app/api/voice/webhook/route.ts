import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWhatsApp } from '@/lib/whatsapp/send';
import { pauseVapiAgent } from '@/lib/vapi/control';

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

      const structured   = message.analysis?.structuredData ?? null;
      const outcome      = detectOutcome(message, structured);
      const transcript   = message.transcript ?? null;
      const summary      = message.analysis?.summary ?? null;
      const recordingUrl = call?.recordingUrl ?? null;
      const callerNumber = call?.customer?.number ?? '';

      // 1. Log call
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

      // 2. Save lead from structured data
      if (structured?.nombre && structured?.tipo_contacto !== 'informacion') {
        if (['lead', 'cita', 'pedido'].includes(structured.tipo_contacto ?? '') ||
            structured.servicio || structured.pedido_items) {
          await supabase.from('leads_voice').insert({
            agent_id:    agentId,
            nombre:      structured.nombre      ?? null,
            negocio:     structured.negocio     ?? null,
            giro:        structured.giro        ?? null,
            servicio:    structured.servicio    ?? structured.pedido_items ?? null,
            presupuesto: structured.presupuesto ?? null,
            timeline:    structured.timeline    ?? structured.cita_fecha ?? null,
            email:       structured.email       ?? null,
            whatsapp:    structured.whatsapp    ?? callerNumber ?? null,
            source:      'llamada',
          });
        }
      }

      // 3. Update minutes
      const minutes = Math.ceil(durationSeconds / 60) || 1;
      await supabase.rpc('increment_minutes_used', { agent_id: agentId, minutes });

      // 4. Fetch agent for notifications
      const { data: agent } = await supabase
        .from('voice_agents')
        .select('business_name, transfer_whatsapp, minutes_used, minutes_included, active, phone_number, vapi_agent_id')
        .eq('id', agentId)
        .single();

      const used     = agent?.minutes_used     ?? 0;
      const included = agent?.minutes_included ?? 0;
      const pct      = included > 0 ? (used / included) * 100 : 0;

      // 5. Auto-pause at 100%
      if (agent?.active && used >= included) {
        await supabase.from('voice_agents').update({ active: false }).eq('id', agentId);
        if (agent.phone_number) await pauseVapiAgent(agent.phone_number);
        if (agent.transfer_whatsapp) {
          await sendWhatsApp(
            agent.transfer_whatsapp,
            `⚠️ *Límite de minutos alcanzado — ${agent.business_name}*\n\nTu agente de voz ha sido *pausado automáticamente* al haber utilizado los ${included} minutos de tu plan.\n\nContacta a tu asesor de CentinelIA para reactivar el servicio o adquirir minutos adicionales.`
          );
        }
        break;
      }

      // 6. Warning at 80%
      if (agent?.active && pct >= 80 && (pct - (minutes / included) * 100) < 80) {
        if (agent.transfer_whatsapp) {
          await sendWhatsApp(
            agent.transfer_whatsapp,
            `📊 *Aviso de minutos — ${agent.business_name}*\n\nHas usado el *${Math.round(pct)}%* de tus ${included} minutos incluidos (${used} usados).\n\nContacta a tu asesor de CentinelIA si necesitas ampliar tu plan antes de que el agente se pause automáticamente.`
          );
        }
      }

      // 7. WhatsApp call summary
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

function detectOutcome(message: any, structured: any): string {
  const toolCalls: string[] = (message.toolCallResults ?? []).map((r: any) => r.name ?? '');

  if (toolCalls.includes('crear_lead'))                  return 'lead_created';
  if (toolCalls.includes('agendar_cita'))                return 'appointment_booked';
  if (toolCalls.includes('registrar_pedido'))            return 'order_taken';
  if (toolCalls.includes('notificar_transferencia'))     return 'transferred';
  if (toolCalls.includes('enviar_whatsapp_escalacion'))  return 'escalated_whatsapp';

  if (structured) {
    const tipo = structured.tipo_contacto ?? '';
    if (tipo === 'lead'         || (structured.nombre && structured.servicio)) return 'lead_created';
    if (tipo === 'cita'         || structured.cita_fecha)                       return 'appointment_booked';
    if (tipo === 'pedido'       || structured.pedido_items)                     return 'order_taken';
    if (tipo === 'transferencia')                                                return 'transferred';
  }

  const transcript = (message.transcript ?? '').toLowerCase();
  if (transcript.length > 50) return 'info_provided';
  return 'other';
}
