import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWhatsApp } from '@/lib/whatsapp/send';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Tomorrow's date in YYYY-MM-DD (Supabase runs in UTC; close enough for daily reminders)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString().slice(0, 10);

  const { data: appointments, error } = await supabase
    .from('appointments_voice')
    .select('id, agent_id, nombre, telefono, servicio, fecha, hora')
    .eq('fecha_iso', tomorrowISO)
    .eq('status', 'confirmada')
    .eq('reminder_sent', false)
    .not('telefono', 'is', null);

  if (error) {
    console.error('reminder cron: query error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!appointments?.length) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  // Fetch all unique agent IDs in one query
  const agentIds = [...new Set(appointments.map(a => a.agent_id))];
  const { data: agents } = await supabase
    .from('voice_agents')
    .select('id, business_name, business_phone_display')
    .in('id', agentIds);

  const agentMap = Object.fromEntries((agents ?? []).map(a => [a.id, a]));

  let sent = 0;
  const sentIds: string[] = [];

  for (const appt of appointments) {
    const agent = agentMap[appt.agent_id];
    if (!agent || !appt.telefono) continue;

    const hora = appt.hora ? ` a las ${appt.hora}` : '';
    const msg = [
      `📅 *Recordatorio de cita, ${agent.business_name}*`,
      ``,
      `Hola${appt.nombre ? ` ${appt.nombre.split(' ')[0]}` : ''},`,
      `Le recordamos que tiene una cita mañana${hora}.`,
      appt.servicio ? `Servicio: ${appt.servicio}` : null,
      ``,
      `Si necesita cancelar o reagendar, llámenos al ${agent.business_phone_display}.`,
    ].filter(l => l !== null).join('\n');

    const ok = await sendWhatsApp(appt.telefono, msg);
    if (ok) {
      sentIds.push(appt.id);
      sent++;
    }
  }

  // Mark reminders as sent
  if (sentIds.length > 0) {
    await supabase
      .from('appointments_voice')
      .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
      .in('id', sentIds);
  }

  console.log(`appointment-reminders cron: sent ${sent}/${appointments.length} for ${tomorrowISO}`);
  return NextResponse.json({ ok: true, sent, total: appointments.length, date: tomorrowISO });
}
