import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { pauseVapiAgent } from '@/lib/vapi/control';
import { sendWhatsApp } from '@/lib/whatsapp/send';
import { sendEmail } from '@/lib/email/send';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: agents, error } = await supabase
    .from('voice_agents')
    .select('id, business_name, client_email, transfer_whatsapp, phone_number')
    .eq('billing_status', 'pago_fallido')
    .lte('grace_period_ends_at', now)
    .eq('active', true);

  if (error) {
    console.error('grace-period-check query error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const paused: string[] = [];

  for (const agent of agents ?? []) {
    await supabase.from('voice_agents').update({ active: false }).eq('id', agent.id);

    if (agent.phone_number) await pauseVapiAgent(agent.phone_number);

    if (agent.transfer_whatsapp) {
      await sendWhatsApp(
        agent.transfer_whatsapp,
        `📴 *Agente pausado — ${agent.business_name}*\n\nEl período de gracia venció sin recibir el pago. Tu agente de voz ha sido pausado.\n\nActualiza tu método de pago para reactivar el servicio.`
      ).catch(console.error);
    }

    if (agent.client_email) {
      await sendEmail({
        to: agent.client_email,
        subject: `📴 Agente pausado — ${agent.business_name}`,
        html: agentPausedHtml(agent.business_name),
      }).catch(console.error);
    }

    paused.push(agent.id);
  }

  return NextResponse.json({ paused, count: paused.length });
}

function agentPausedHtml(businessName: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;padding:24px">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
      <div style="color:#ef4444;font-size:18px;font-weight:700;margin-bottom:16px">📴 Agente pausado — ${businessName}</div>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0">
        El período de gracia de 3 días venció sin recibir el pago de tu suscripción Centinelia.<br><br>
        Tu agente de voz ha sido <strong>pausado</strong>. Para reactivarlo, actualiza tu método de pago o contáctanos.
      </p>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f3f4f6;color:#9ca3af;font-size:12px">
        Centinelia · Pneuma Studio
      </div>
    </div>
  </body></html>`;
}
