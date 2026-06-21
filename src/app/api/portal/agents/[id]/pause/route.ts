import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySession, PORTAL_COOKIE } from '@/lib/portal/auth';
import { pauseVapiAgent, resumeVapiAgent } from '@/lib/vapi/control';

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id }     = await params;
  const { action } = await req.json() as { action: 'pause' | 'resume' };

  const cookie  = req.cookies.get(PORTAL_COOKIE)?.value ?? '';
  const session = await verifySession(cookie);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const supabase = createAdminClient();

  const { data: agent } = await supabase
    .from('voice_agents')
    .select('id, phone_number, vapi_agent_id, active, client_paused, billing_status, portal_email')
    .eq('id', id)
    .eq('portal_email', session.portalEmail)
    .single();

  if (!agent) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  if (action === 'pause') {
    await pauseVapiAgent(agent.phone_number);
    await supabase
      .from('voice_agents')
      .update({ active: false, client_paused: true, client_paused_at: new Date().toISOString() })
      .eq('id', id);
  } else {
    // Only resume if billing is not blocking
    if (agent.billing_status === 'pago_fallido') {
      return NextResponse.json({ error: 'No se puede reanudar: pago pendiente' }, { status: 403 });
    }
    await resumeVapiAgent(agent.phone_number, agent.vapi_agent_id);
    await supabase
      .from('voice_agents')
      .update({ active: true, client_paused: false, client_paused_at: null })
      .eq('id', id);
  }

  return NextResponse.json({ ok: true });
}
