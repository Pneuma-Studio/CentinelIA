export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import CallsSection from '../agentes/[id]/CallsSection';
import type { VoiceCall } from '@/types/agent';

export default async function LlamadasPage() {
  const supabase = createAdminClient();

  const [{ data: callsData }, { data: agentsData }] = await Promise.all([
    supabase
      .from('voice_calls')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('voice_agents').select('id, business_name, timezone'),
  ]);

  const calls = (callsData ?? []) as VoiceCall[];
  const agentMap: Record<string, { business_name: string; timezone: string }> = {};
  for (const a of agentsData ?? []) {
    agentMap[a.id] = { business_name: a.business_name, timezone: a.timezone };
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Llamadas</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Últimas {calls.length} llamadas · todos los agentes
        </p>
      </div>

      {calls.length === 0 ? (
        <div className="p-12 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Sin llamadas registradas todavía</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(
            calls.reduce((groups: Record<string, VoiceCall[]>, call) => {
              const agentId = call.agent_id;
              if (!groups[agentId]) groups[agentId] = [];
              groups[agentId].push(call);
              return groups;
            }, {})
          ).map(([agentId, agentCalls]) => {
            const agent = agentMap[agentId];
            return (
              <div key={agentId}>
                <div className="text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {agent?.business_name ?? agentId}
                </div>
                <CallsSection
                  calls={agentCalls}
                  timezone={agent?.timezone ?? 'America/Monterrey'}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
