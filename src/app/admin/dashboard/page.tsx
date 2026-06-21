export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { PhoneCall, TrendingUp, Clock, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const OUTCOME_LABELS: Record<string, { label: string; color: string }> = {
  lead_created:       { label: 'Lead',        color: '#22c55e' },
  appointment_booked: { label: 'Cita',         color: '#3b82f6' },
  order_taken:        { label: 'Pedido',       color: '#f59e0b' },
  transferred:        { label: 'Transferido',  color: '#a855f7' },
  info_provided:      { label: 'Información',  color: '#6b7280' },
  escalated_whatsapp: { label: 'WhatsApp',     color: '#25D366' },
  other:              { label: 'Otro',         color: '#4b5563' },
};

export default async function DashboardPage() {
  const supabase = createAdminClient();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: agents },
    { data: calls24h },
    { data: recentCalls },
    { data: recentLeads },
    { count: orders24h },
    { count: appts24h },
  ] = await Promise.all([
    supabase.from('voice_agents').select('id, business_name, minutes_used, minutes_included, active'),
    supabase.from('voice_calls').select('id, agent_id, duration_seconds, lead_created, outcome').gte('created_at', since24h),
    supabase.from('voice_calls').select('id, agent_id, caller_number, outcome, duration_seconds, created_at').order('created_at', { ascending: false }).limit(8),
    supabase.from('leads_voice').select('id, agent_id, nombre, negocio, servicio, created_at').order('created_at', { ascending: false }).limit(6),
    supabase.from('orders_voice').select('*', { count: 'exact', head: true }).gte('created_at', since24h),
    supabase.from('appointments_voice').select('*', { count: 'exact', head: true }).gte('created_at', since24h),
  ]);

  const agentList = agents ?? [];
  const callList24h = calls24h ?? [];

  const agentMap: Record<string, string> = {};
  for (const a of agentList) agentMap[a.id] = a.business_name;

  const todayMinutes = callList24h.reduce((s, c) => s + Math.ceil((c.duration_seconds ?? 0) / 60), 0);
  const todayLeads   = callList24h.filter(c => c.lead_created).length;
  const todayResults = todayLeads + (orders24h ?? 0) + (appts24h ?? 0);
  const activeAgents = agentList.filter(a => a.active).length;

  const criticalAgents = agentList.filter(a => a.active && (a.minutes_used / a.minutes_included) > 0.8);

  const resultSub = todayResults > 0
    ? [todayLeads > 0 && `${todayLeads} leads`, (orders24h ?? 0) > 0 && `${orders24h} pedidos`, (appts24h ?? 0) > 0 && `${appts24h} citas`].filter(Boolean).join(' · ')
    : undefined;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--c-text-3)' }}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={<PhoneCall size={18} />} label="Llamadas (24h)" value={callList24h.length.toString()} color="#6C3BFF" />
        <KpiCard icon={<TrendingUp size={18} />} label="Resultados (24h)" value={todayResults.toString()} color="#22c55e" sub={resultSub} />
        <KpiCard icon={<Clock size={18} />} label="Minutos (24h)" value={todayMinutes.toString()} color="#a855f7" />
        <KpiCard icon={<Users size={18} />} label="Agentes activos" value={`${activeAgents} / ${agentList.length}`} color="#f59e0b" />
      </div>

      {/* Alerts */}
      {criticalAgents.length > 0 && (
        <div className="mb-6 flex flex-col gap-2">
          {criticalAgents.map(a => {
            const pct = Math.round((a.minutes_used / a.minutes_included) * 100);
            const color = pct >= 100 ? '#ef4444' : '#f59e0b';
            return (
              <Link key={a.id} href={`/admin/agentes/${a.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:opacity-90 transition-opacity"
                style={{ background: `${color}0f`, border: `1px solid ${color}33` }}>
                <AlertTriangle size={14} style={{ color, flexShrink: 0 }} />
                <span className="text-sm flex-1" style={{ color: 'var(--c-text)' }}>{a.business_name}</span>
                <span className="text-xs font-semibold" style={{ color }}>{pct}% de minutos usados</span>
                <ArrowRight size={13} style={{ color: 'var(--c-text-3)' }} />
              </Link>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent leads */}
        <Section title="Leads recientes" link="/admin/leads">
          {(recentLeads ?? []).length === 0 ? (
            <Empty text="Sin leads aún — se registran automáticamente al terminar una llamada" />
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: 'var(--c-divider)' }}>
              {(recentLeads ?? []).map(lead => (
                <Link key={lead.id} href={`/admin/agentes/${lead.agent_id}`}
                  className="py-2.5 flex items-start justify-between gap-3 -mx-1 px-1 rounded transition-colors"
                  style={{ ['--hover-bg' as string]: 'var(--c-hover)' }}>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{lead.nombre ?? 'Sin nombre'}</div>
                    {lead.negocio && (
                      <div className="text-xs truncate mt-0.5" style={{ color: 'var(--c-text-3)' }}>{lead.negocio}</div>
                    )}
                    {lead.servicio && (
                      <div className="text-xs truncate mt-0.5" style={{ color: '#9B6DFF' }}>{lead.servicio}</div>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs" style={{ color: 'var(--c-text-3)' }}>{agentMap[lead.agent_id] ?? ''}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--c-text-4)' }}>
                      {new Date(lead.created_at).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Section>

        {/* Recent calls */}
        <Section title="Llamadas recientes" link="/admin/llamadas">
          {(recentCalls ?? []).length === 0 ? (
            <Empty text="Sin llamadas — asegúrate de que el número esté activo en Vapi" />
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: 'var(--c-divider)' }}>
              {(recentCalls ?? []).map(call => (
                <Link key={call.id} href={`/admin/agentes/${call.agent_id}`}
                  className="py-2.5 flex items-center justify-between gap-3 -mx-1 px-1 rounded transition-colors">
                  <div className="min-w-0">
                    <div className="text-sm truncate" style={{ color: 'var(--c-text)' }}>{call.caller_number || 'Desconocido'}</div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--c-text-3)' }}>{agentMap[call.agent_id] ?? ''}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <OutcomeBadge outcome={call.outcome} />
                    <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>
                      {Math.ceil(call.duration_seconds / 60)}m
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color, sub }: { icon: React.ReactNode; label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="p-5 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
      <div className="flex items-center gap-2 mb-3" style={{ color }}>{icon}</div>
      <div className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--c-text-2)' }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--c-text-4)' }}>{sub}</div>}
    </div>
  );
}

function Section({ title, link, children }: { title: string; link?: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>{title}</h2>
        {link && (
          <Link href={link} className="text-xs hover:underline" style={{ color: '#9B6DFF' }}>Ver todo →</Link>
        )}
      </div>
      {children}
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const o = OUTCOME_LABELS[outcome] ?? OUTCOME_LABELS.other;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${o.color}22`, color: o.color }}>
      {o.label}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-xs py-6 text-center leading-relaxed" style={{ color: 'var(--c-text-4)' }}>{text}</p>;
}
