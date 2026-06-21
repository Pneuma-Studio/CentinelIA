export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import ClientesClient from './ClientesClient';

export default async function ClientesPage() {
  const supabase = createAdminClient();
  const { data: agents } = await supabase
    .from('voice_agents')
    .select('id, client_name, client_email, business_name, plan, active, billing_status, minutes_used, minutes_included, portal_email, created_at')
    .order('created_at', { ascending: false });

  type ClientGroup = {
    key: string;
    client_name: string;
    client_email: string | null;
    portal_email: string | null;
    agents: {
      id: string;
      business_name: string;
      plan: string;
      active: boolean;
      billing_status: string | null;
      minutes_used: number;
      minutes_included: number;
    }[];
  };

  // Group by client_email (fallback: client_name)
  const map = new Map<string, ClientGroup>();

  for (const agent of agents ?? []) {
    const key = agent.client_email?.toLowerCase().trim() || agent.client_name;
    if (!map.has(key)) {
      map.set(key, {
        key,
        client_name:  agent.client_name,
        client_email: agent.client_email ?? null,
        portal_email: agent.portal_email ?? null,
        agents:       [],
      });
    }
    map.get(key)!.agents.push({
      id:               agent.id,
      business_name:    agent.business_name,
      plan:             agent.plan,
      active:           agent.active,
      billing_status:   agent.billing_status ?? null,
      minutes_used:     agent.minutes_used,
      minutes_included: agent.minutes_included,
    });
  }

  const clients = Array.from(map.values());

  return <ClientesClient clients={clients} />;
}
