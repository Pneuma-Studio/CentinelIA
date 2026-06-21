export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { Phone, Clock, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { MINUTES_PLAN_CONFIG } from '@/lib/billing/plans';
import type { MinutesPlan } from '@/lib/billing/plans';
import AnalyticsAgentsTable from './AnalyticsAgentsTable';
import type { AgentRow } from './AnalyticsAgentsTable';

interface Props {
  searchParams: Promise<{ period?: string }>;
}

const OUTCOME_LABELS: Record<string, { label: string; color: string }> = {
  lead_created:       { label: 'Leads',      color: '#22c55e' },
  appointment_booked: { label: 'Citas',       color: '#3b82f6' },
  order_taken:        { label: 'Pedidos',     color: '#f59e0b' },
  transferred:        { label: 'Transferidos', color: '#a855f7' },
  info_provided:      { label: 'Información', color: '#6b7280' },
  escalated_whatsapp: { label: 'WhatsApp',   color: '#25D366' },
  other:              { label: 'Otro',        color: '#4b5563' },
};

const PERIOD_OPTIONS = [
  { label: '7 días',  param: '7' },
  { label: '30 días', param: '30' },
  { label: '90 días', param: '90' },
  { label: 'Todo',    param: '' },
];

export default async function AnalyticsPage({ searchParams }: Props) {
  const { period } = await searchParams;
  const days  = period ? parseInt(period) : undefined;
  const since = days ? new Date(Date.now() - days * 86400000).toISOString() : undefined;

  const supabase = createAdminClient();

  const [
    { data: calls },
    { data: agents },
    { data: leads },
  ] = await Promise.all([
    since
      ? supabase.from('voice_calls').select('*').gte('created_at', since).order('created_at', { ascending: false })
      : supabase.from('voice_calls').select('*').order('created_at', { ascending: false }),
    supabase.from('voice_agents').select('id, business_name, minutes_used, minutes_plan, plan, active').order('created_at'),
    since
      ? supabase.from('leads_voice').select('id, created_at, agent_id').gte('created_at', since)
      : supabase.from('leads_voice').select('id, created_at, agent_id'),
  ]);

  const allCalls  = calls  ?? [];
  const allAgents = agents ?? [];
  const allLeads  = leads  ?? [];

  const totalCalls    = allCalls.length;
  const totalDuration = allCalls.reduce((s, c) => s + (c.duration_seconds ?? 0), 0);
  const avgDuration   = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;
  const totalLeads    = allLeads.length;
  const conversionRate = totalCalls > 0 ? ((totalLeads / totalCalls) * 100).toFixed(1) : '0';

  const mrr = allAgents
    .filter(a => a.active && a.minutes_plan)
    .reduce((sum, a) => sum + (MINUTES_PLAN_CONFIG[a.minutes_plan as MinutesPlan]?.mxn ?? 0), 0);
  const activeAgentsCount = allAgents.filter(a => a.active).length;

  const outcomeCounts: Record<string, number> = {};
  for (const call of allCalls) {
    outcomeCounts[call.outcome] = (outcomeCounts[call.outcome] ?? 0) + 1;
  }

  const hourCounts = Array(24).fill(0);
  for (const call of allCalls) {
    const h = new Date(call.created_at).getHours();
    hourCounts[h]++;
  }
  const peakHour    = hourCounts.indexOf(Math.max(...hourCounts));
  const maxHourCount = Math.max(...hourCounts, 1);

  const chartDays = days ? Math.min(days, 30) : 14;
  const dayCounts: Record<string, number> = {};
  const today = new Date();
  for (let i = chartDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dayCounts[d.toISOString().slice(0, 10)] = 0;
  }
  for (const call of allCalls) {
    const day = call.created_at.slice(0, 10);
    if (day in dayCounts) dayCounts[day]++;
  }
  const dayEntries  = Object.entries(dayCounts);
  const maxDayCount = Math.max(...Object.values(dayCounts), 1);

  const agentCallMap: Record<string, { calls: number; leads: number; duration: number }> = {};
  for (const call of allCalls) {
    if (!agentCallMap[call.agent_id]) agentCallMap[call.agent_id] = { calls: 0, leads: 0, duration: 0 };
    agentCallMap[call.agent_id].calls++;
    agentCallMap[call.agent_id].duration += call.duration_seconds ?? 0;
  }
  for (const lead of allLeads) {
    if (!agentCallMap[lead.agent_id]) agentCallMap[lead.agent_id] = { calls: 0, leads: 0, duration: 0 };
    agentCallMap[lead.agent_id].leads++;
  }

  const agentRows: AgentRow[] = allAgents.map(a => {
    const stats  = agentCallMap[a.id] ?? { calls: 0, leads: 0, duration: 0 };
    const avgMin = stats.calls > 0 ? Math.round(stats.duration / stats.calls / 60) : 0;
    const mxn    = a.minutes_plan ? (MINUTES_PLAN_CONFIG[a.minutes_plan as MinutesPlan]?.mxn ?? 0) : 0;
    return {
      id:           a.id,
      business_name: a.business_name,
      plan:         a.plan,
      active:       a.active,
      mxn,
      calls:        stats.calls,
      leads:        stats.leads,
      avgMin,
      minutesUsed:  a.minutes_used,
    };
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>Analytics</h1>
          <div className="flex items-center gap-2 mt-2">
            {PERIOD_OPTIONS.map(({ label, param }) => {
              const active = (period ?? '') === param;
              return (
                <Link
                  key={param}
                  href={param ? `/admin/analytics?period=${param}` : '/admin/analytics'}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: active ? '#6C3BFF' : 'var(--c-surface)',
                    color: active ? '#fff' : 'var(--c-text-3)',
                    border: `1px solid ${active ? '#6C3BFF' : 'var(--c-border)'}`,
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>
            ${mrr.toLocaleString('es-MX')} <span className="text-base font-normal" style={{ color: 'var(--c-text-3)' }}>MXN</span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>MRR estimado · {activeAgentsCount} activos</div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={<Phone size={18} />}      label="Total llamadas"      value={totalCalls.toString()} color="#6C3BFF" />
        <KpiCard icon={<Clock size={18} />}       label="Duración promedio"   value={`${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`} color="#a855f7" />
        <KpiCard icon={<Users size={18} />}       label="Leads generados"     value={totalLeads.toString()} color="#22c55e" />
        <KpiCard icon={<TrendingUp size={18} />}  label="Tasa de conversión"  value={`${conversionRate}%`} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Calls per day */}
        <div className="p-5 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>
            Llamadas — últimos {chartDays} días
          </h2>
          <div className="flex items-end gap-1 h-24">
            {dayEntries.map(([day, count]) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm transition-all"
                  style={{
                    height: `${Math.max((count / maxDayCount) * 88, count > 0 ? 4 : 0)}px`,
                    background: count > 0 ? '#6C3BFF' : 'var(--c-border)',
                    minHeight: count > 0 ? '4px' : '2px',
                  }}
                />
                <span style={{ color: 'var(--c-text-4)', fontSize: '9px' }}>
                  {new Date(day + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak hours */}
        <div className="p-5 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>
            Horas pico
            {totalCalls > 0 && <span className="ml-2 font-normal normal-case" style={{ color: '#f59e0b' }}>pico: {peakHour}:00</span>}
          </h2>
          <div className="flex items-end gap-px h-24">
            {hourCounts.map((count, h) => (
              <div key={h} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: `${Math.max((count / maxHourCount) * 88, count > 0 ? 3 : 0)}px`,
                    background: h === peakHour && count > 0 ? '#f59e0b' : count > 0 ? '#a855f7' : 'var(--c-border)',
                    minHeight: count > 0 ? '3px' : '1px',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span style={{ color: 'var(--c-text-4)', fontSize: '9px' }}>0h</span>
            <span style={{ color: 'var(--c-text-4)', fontSize: '9px' }}>12h</span>
            <span style={{ color: 'var(--c-text-4)', fontSize: '9px' }}>23h</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outcome distribution */}
        <div className="p-5 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>
            Resultados
          </h2>
          {totalCalls === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--c-text-3)' }}>Sin datos aún</p>
          ) : (
            <div className="flex flex-col gap-2">
              {Object.entries(outcomeCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([outcome, count]) => {
                  const info = OUTCOME_LABELS[outcome] ?? OUTCOME_LABELS.other;
                  const pct  = Math.round((count / totalCalls) * 100);
                  return (
                    <div key={outcome}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: info.color }}>{info.label}</span>
                        <span className="text-xs" style={{ color: 'var(--c-text-2)' }}>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--c-border)' }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: info.color }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Per-agent performance */}
        <div className="p-5 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>
            Por agente
          </h2>
          <AnalyticsAgentsTable rows={agentRows} />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="p-5 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
      <div className="flex items-center gap-2 mb-3" style={{ color }}>
        {icon}
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>{value}</div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--c-text-2)' }}>{label}</div>
    </div>
  );
}

