import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { updateVapiAssistant } from '@/lib/vapi/sync';
import type { VoiceAgent } from '@/types/agent';

interface Params { params: Promise<{ token: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const { data: agent } = await supabase
    .from('voice_agents').select('id, vapi_agent_id').eq('portal_token', token).single();
  if (!agent) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const allowed = ['business_hours', 'knowledge_base', 'notify_whatsapp', 'notify_email', 'first_message', 'transfer_rules', 'missed_call_recovery'];
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase
    .from('voice_agents').update(update).eq('id', agent.id).select('*').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync to Vapi so the agent picks up the new content immediately
  if (agent.vapi_agent_id) {
    updateVapiAssistant(agent.vapi_agent_id, data as VoiceAgent).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
