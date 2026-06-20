export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import LeadsPipeline from './LeadsPipeline';

export default async function LeadsPage() {
  const supabase = createAdminClient();

  const [{ data: leadsData }, { data: agentsData }] = await Promise.all([
    supabase.from('leads_voice').select('*').order('created_at', { ascending: false }),
    supabase.from('voice_agents').select('id, business_name').order('business_name'),
  ]);

  const leads = leadsData ?? [];
  const agents = agentsData ?? [];

  const agentMap: Record<string, string> = {};
  for (const a of agents) agentMap[a.id] = a.business_name;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {leads.length} lead{leads.length !== 1 ? 's' : ''} · todos los agentes
          </p>
        </div>
      </div>

      <LeadsPipeline leads={leads} agentMap={agentMap} />
    </div>
  );
}
