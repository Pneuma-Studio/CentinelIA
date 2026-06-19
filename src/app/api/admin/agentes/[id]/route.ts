import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createVapiAssistant, updateVapiAssistant, assignAssistantToPhone } from '@/lib/vapi/sync';
import type { VoiceAgent } from '@/types/agent';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('voice_agents').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('voice_agents')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const agent = data as VoiceAgent;
  const isFullUpdate = body.business_name !== undefined;

  if (isFullUpdate) {
    if (agent.vapi_agent_id) {
      // Update existing Vapi assistant
      await updateVapiAssistant(agent.vapi_agent_id, agent);

      // Re-assign if phone number changed
      if (agent.phone_number) {
        await assignAssistantToPhone(agent.phone_number, agent.vapi_agent_id);
      }
    } else {
      // First time syncing — create assistant and assign
      const vapiAssistantId = await createVapiAssistant(agent);
      if (vapiAssistantId) {
        await supabase
          .from('voice_agents')
          .update({ vapi_agent_id: vapiAssistantId })
          .eq('id', id);

        if (agent.phone_number) {
          await assignAssistantToPhone(agent.phone_number, vapiAssistantId);
        }
      }
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from('voice_agents').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
