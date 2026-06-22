import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySession, PORTAL_COOKIE } from '@/lib/portal/auth';
import { updateVapiAssistant } from '@/lib/vapi/sync';
import type { VoiceAgent } from '@/types/agent';

interface Params { params: Promise<{ token: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;

  const cookie  = req.cookies.get(PORTAL_COOKIE)?.value ?? '';
  const session = await verifySession(cookie);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { voice_id } = await req.json();
  if (!voice_id || typeof voice_id !== 'string') {
    return NextResponse.json({ error: 'voice_id requerido' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: agent } = await supabase
    .from('voice_agents')
    .select('*')
    .eq('portal_token', token)
    .eq('portal_email', session.portalEmail)
    .single();

  if (!agent) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  await supabase
    .from('voice_agents')
    .update({ elevenlabs_voice_id: voice_id })
    .eq('id', agent.id);

  if (agent.vapi_agent_id) {
    await updateVapiAssistant(agent.vapi_agent_id, { ...agent, elevenlabs_voice_id: voice_id } as VoiceAgent);
  }

  return NextResponse.json({ ok: true });
}
