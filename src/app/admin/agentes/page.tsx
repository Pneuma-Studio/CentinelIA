import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Plus, PhoneCall, CheckCircle, XCircle } from 'lucide-react';
import type { VoiceAgent } from '@/types/agent';
import { PLAN_LABELS } from '@/types/agent';

export default async function AgentesPage() {
  const supabase = createAdminClient();
  const { data: agentes } = await supabase
    .from('voice_agents')
    .select('*')
    .order('created_at', { ascending: false });

  const list = (agentes ?? []) as VoiceAgent[];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Agentes de Voz</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {list.length} agente{list.length !== 1 ? 's' : ''} configurado{list.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/agentes/nuevo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: '#00e5ff', color: '#080d1a' }}
        >
          <Plus size={15} />
          Nuevo agente
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-24" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <PhoneCall size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">Sin agentes configurados</p>
          <p className="text-sm mt-1">Crea tu primer agente para empezar.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((agent) => (
            <Link
              key={agent.id}
              href={`/admin/agentes/${agent.id}`}
              className="flex items-center justify-between p-5 rounded-xl border transition-colors hover:border-cyan-500/40"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,229,255,0.1)' }}>
                  <PhoneCall size={18} style={{ color: '#00e5ff' }} />
                </div>
                <div>
                  <div className="font-semibold text-white">{agent.business_name}</div>
                  <div className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{agent.client_name} · {agent.phone_number || 'Sin número'}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <PlanBadge plan={agent.plan} />
                <MinutesBadge used={agent.minutes_used} included={agent.minutes_included} />
                {agent.active
                  ? <CheckCircle size={18} color="#22c55e" />
                  : <XCircle size={18} color="#ef4444" />
                }
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanBadge({ plan }: { plan: VoiceAgent['plan'] }) {
  const colors: Record<string, string> = {
    basico:   '#6b7280',
    estandar: '#3b82f6',
    pro:      '#a855f7',
  };
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: `${colors[plan]}22`, color: colors[plan], border: `1px solid ${colors[plan]}44` }}>
      {PLAN_LABELS[plan]}
    </span>
  );
}

function MinutesBadge({ used, included }: { used: number; included: number }) {
  const pct = Math.min((used / included) * 100, 100);
  const color = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e';
  return (
    <div className="text-right">
      <div className="text-xs font-semibold" style={{ color }}>
        {used} / {included} min
      </div>
      <div className="w-20 h-1 rounded-full mt-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
