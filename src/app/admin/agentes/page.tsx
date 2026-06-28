export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import type { VoiceAgent } from '@/types/agent';
import { PLAN_LABELS } from '@/types/agent';
import AgentesClient from './AgentesClient';

export default async function AgentesPage() {
  const supabase = createAdminClient();
  const demoId = process.env.DEMO_AGENT_ID;
  const { data: agentes } = await supabase
    .from('voice_agents')
    .select('*')
    .order('created_at', { ascending: false })
    .neq('id', demoId ?? '');

  return <AgentesClient list={(agentes ?? []) as VoiceAgent[]} />;
}
