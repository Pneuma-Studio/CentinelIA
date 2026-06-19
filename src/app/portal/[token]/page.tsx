export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { Phone, Users, TrendingUp, Clock } from 'lucide-react';
import type { VoiceCall } from '@/types/agent';

interface Props { params: Promise<{ token: string }> }

const OUTCOME_LABELS: Record<string, { label: string; color: string }> = {
  lead_created:       { label: 'Lead',        color: '#22c55e' },
  appointment_booked: { label: 'Cita',         color: '#3b82f6' },
  order_taken:        { label: 'Pedido',       color: '#f59e0b' },
  transferred:        { label: 'Transferido',  color: '#a855f7' },
  info_provided:      { label: 'Información',  color: '#6b7280' },
  escalated_whatsapp: { label: 'WhatsApp',     color: '#25D366' },
  other:              { label: 'Otro',         color: '#4b5563' },
};

export default async function ClientPortalPage({ params }: Props) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: agentData } = await supabase
    .from('voice_agents')
    .select('*')
    .eq('portal_token', token)
    .single();

  if (!agentData) notFound();

  const [{ data: callsData }, { data: leadsData }] = await Promise.all([
    supabase.from('voice_calls').select('*').eq('agent_id', agentData.id).order('created_at', { ascending: false }).limit(50),
    supabase.from('leads_voice').select('*').eq('agent_id', agentData.id).order('created_at', { ascending: false }),
  ]);

  const calls  = (callsData  ?? []) as VoiceCall[];
  const leads  = leadsData   ?? [];

  const totalCalls    = calls.length;
  const totalLeads    = leads.length;
  const totalDuration = calls.reduce((s, c) => s + (c.duration_seconds ?? 0), 0);
  const avgMin        = totalCalls > 0 ? Math.round(totalDuration / totalCalls / 60) : 0;
  const conversion    = totalCalls > 0 ? ((totalLeads / totalCalls) * 100).toFixed(0) : '0';

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e', color: '#e2e8f0' }}>
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#080d1a' }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: '#00e5ff' }}>CentinelIA</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span className="text-sm text-white font-semibold">{agentData.business_name}</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff' }}>
          Portal del cliente
        </span>
      </div>

      <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={<Phone size={16} />} label="Llamadas" value={totalCalls.toString()} color="#00e5ff" />
          <KpiCard icon={<Users size={16} />} label="Leads" value={totalLeads.toString()} color="#22c55e" />
          <KpiCard icon={<TrendingUp size={16} />} label="Conversión" value={`${conversion}%`} color="#f59e0b" />
          <KpiCard icon={<Clock size={16} />} label="Duración prom." value={`${avgMin} min`} color="#a855f7" />
        </div>

        {/* Leads */}
        <Section title={`Leads capturados (${leads.length})`}>
          {leads.length === 0 ? (
            <Empty text="Sin leads registrados aún" />
          ) : (
            <div className="flex flex-col gap-2">
              {leads.map((lead: Record<string, string>) => (
                <div key={lead.id} className="px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white text-sm">{lead.nombre ?? 'Sin nombre'}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {new Date(lead.created_at).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  {lead.negocio && (
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {lead.negocio}{lead.giro ? ` · ${lead.giro}` : ''}
                    </div>
                  )}
                  {lead.servicio && <div className="text-xs mt-0.5" style={{ color: '#00e5ff' }}>{lead.servicio}</div>}
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {lead.presupuesto && <Chip>💰 {lead.presupuesto}</Chip>}
                    {lead.timeline    && <Chip>📅 {lead.timeline}</Chip>}
                    {lead.whatsapp    && <Chip>📱 {lead.whatsapp}</Chip>}
                    {lead.email       && <Chip>📧 {lead.email}</Chip>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Calls */}
        <Section title={`Llamadas recientes (${calls.length})`}>
          {calls.length === 0 ? (
            <Empty text="Sin llamadas registradas aún" />
          ) : (
            <div className="flex flex-col gap-2">
              {calls.map(call => {
                const outcome = OUTCOME_LABELS[call.outcome] ?? OUTCOME_LABELS.other;
                return (
                  <div key={call.id} className="px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{call.caller_number || 'Desconocido'}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                          style={{ background: `${outcome.color}22`, color: outcome.color }}>
                          {outcome.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {Math.ceil(call.duration_seconds / 60)} min
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {new Date(call.created_at).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>
                    {call.summary && (
                      <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {call.summary}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="mb-2" style={{ color }}>{icon}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{title}</h2>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm py-4 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>{text}</p>;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{children}</span>
  );
}
