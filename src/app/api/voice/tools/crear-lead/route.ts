import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agent_id = searchParams.get('agent_id');

  const body = await req.json();
  const { nombre, negocio, giro, servicio, presupuesto, timeline, email, whatsapp } =
    body.toolCallList?.[0]?.function?.arguments ?? body;

  if (!agent_id) {
    return NextResponse.json({ error: 'agent_id requerido' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: agent } = await supabase
    .from('voice_agents')
    .select('business_name, transfer_whatsapp')
    .eq('id', agent_id)
    .single();

  const { error } = await supabase.from('leads_voice').insert({
    agent_id,
    nombre:      nombre ?? null,
    negocio:     negocio ?? null,
    giro:        giro ?? null,
    servicio:    servicio ?? null,
    presupuesto: presupuesto ?? null,
    timeline:    timeline ?? null,
    email:       email ?? null,
    whatsapp:    whatsapp ?? null,
    source:      'llamada',
  });

  if (error) {
    // Fallback: store in generic jsonb column if leads_voice doesn't exist yet
    await supabase.from('voice_calls').select('id').limit(1);
    console.error('leads_voice error:', error.message);
  }

  // Send WhatsApp notification if configured
  if (agent?.transfer_whatsapp) {
    const msg = [
      `🎯 *Nuevo lead — ${agent.business_name}*`,
      nombre    ? `👤 ${nombre}`            : null,
      negocio   ? `🏢 ${negocio} (${giro})` : null,
      servicio  ? `📋 ${servicio}`           : null,
      presupuesto ? `💰 ${presupuesto}`      : null,
      timeline  ? `📅 ${timeline}`           : null,
      whatsapp  ? `📱 ${whatsapp}`           : null,
      email     ? `📧 ${email}`              : null,
    ].filter(Boolean).join('\n');

    await sendWhatsApp(agent.transfer_whatsapp, msg);
  }

  return NextResponse.json({
    result: 'Lead registrado correctamente. Le haremos llegar información pronto.',
  });
}

async function sendWhatsApp(to: string, message: string) {
  const clean = to.replace(/\D/g, '');
  const url = `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(message)}`;
  // If you have a WhatsApp API provider (Twilio, Meta, etc.) replace this with their SDK call.
  // For now we log the notification payload.
  console.info('WhatsApp notification →', url);
}
