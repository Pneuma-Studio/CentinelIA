export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import type { VoiceCall } from '@/types/agent';
import LlamadasClient from './LlamadasClient';

export default async function LlamadasPage() {
  const supabase = createAdminClient();

  const [{ data: callsData }, { data: agentsData }] = await Promise.all([
    supabase.from('voice_calls').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('voice_agents').select('id, business_name, timezone').order('business_name'),
  ]);

  const calls = (callsData ?? []) as VoiceCall[];
  const agents = (agentsData ?? []).map(a => ({
    id: a.id,
    business_name: a.business_name,
    timezone: a.timezone ?? 'America/Monterrey',
  }));

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Llamadas</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Últimas {calls.length} llamadas · todos los agentes
        </p>
      </div>

      <LlamadasClient calls={calls} agents={agents} />
    </div>
  );
}
