import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWhatsApp } from '@/lib/whatsapp/send';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agent_id = searchParams.get('agent_id');

  const body = await req.json();
  const { nombre, motivo, resumen } = body.toolCallList?.[0]?.function?.arguments ?? body;

  if (!agent_id) {
    return NextResponse.json({ error: 'agent_id requerido' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: agent } = await supabase
    .from('voice_agents')
    .select('business_name, transfer_whatsapp, transfer_number')
    .eq('id', agent_id)
    .single();

  if (agent?.transfer_whatsapp) {
    const msg = [
      `📞 *Transferencia entrante, ${agent.business_name}*`,
      nombre  ? `👤 Cliente: ${nombre}`  : null,
      `📋 Motivo: ${motivo}`,
      resumen ? `📝 ${resumen}`          : null,
      `⏱️ El cliente está en línea ahora.`,
    ].filter(Boolean).join('\n');

    await sendWhatsApp(agent.transfer_whatsapp, msg);
  }

  return NextResponse.json({
    result: 'Notificación enviada. Le transfiero ahora.',
    transfer_number: agent?.transfer_number ?? null,
  });

}
