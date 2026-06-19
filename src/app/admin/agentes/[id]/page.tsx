export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Globe, Calendar, CheckCircle, XCircle, Pencil } from 'lucide-react';
import type { VoiceAgent, VoiceCall } from '@/types/agent';
import { PLAN_LABELS, FEATURE_LABELS } from '@/types/agent';
import AgentActions from './AgentActions';
import CallsSection from './CallsSection';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AgentDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: agentData }, { data: callsData }, { data: leadsData }] = await Promise.all([
    supabase.from('voice_agents').select('*').eq('id', id).single(),
    supabase.from('voice_calls').select('*').eq('agent_id', id).order('created_at', { ascending: false }).limit(20),
    supabase.from('leads_voice').select('*').eq('agent_id', id).order('created_at', { ascending: false }).limit(10),
  ]);

  if (!agentData) notFound();

  const agent = agentData as VoiceAgent;
  const calls = (callsData ?? []) as VoiceCall[];
  const leads = leadsData ?? [];

  const planColors: Record<string, string> = {
    basico: '#6b7280', estandar: '#3b82f6', pro: '#a855f7',
  };
  const planColor = planColors[agent.plan] ?? '#6b7280';
  const minutesPct = Math.min((agent.minutes_used / agent.minutes_included) * 100, 100);
  const minutesColor = minutesPct > 90 ? '#ef4444' : minutesPct > 70 ? '#f59e0b' : '#22c55e';

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/agentes" className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{agent.business_name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${planColor}22`, color: planColor, border: `1px solid ${planColor}44` }}>
              {PLAN_LABELS[agent.plan]}
            </span>
            {agent.active
              ? <CheckCircle size={16} color="#22c55e" />
              : <XCircle size={16} color="#ef4444" />}
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{agent.client_name}</p>
        </div>
        <Link href={`/admin/agentes/${agent.id}/editar`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Pencil size={13} />
          Editar
        </Link>
        <AgentActions agentId={agent.id} active={agent.active} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Business info */}
          <Card title="Información del negocio">
            <InfoRow label="Descripción" value={agent.business_description} />
            {agent.business_address && <InfoRow label="Dirección" value={agent.business_address} />}
            {agent.business_phone_display && <InfoRow label="Teléfono" value={agent.business_phone_display} icon={<Phone size={13} />} />}
            {agent.phone_number && <InfoRow label="Número Vapi" value={agent.phone_number} icon={<Phone size={13} />} />}
            {agent.calendar_url && <InfoRow label="Calendario" value={agent.calendar_url} icon={<Globe size={13} />} link />}
            <InfoRow label="Zona horaria" value={agent.timezone} icon={<Calendar size={13} />} />
          </Card>

          {/* Features */}
          <Card title="Funcionalidades">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(agent.features) as (keyof typeof agent.features)[]).map(key => (
                <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: agent.features[key] ? '#22c55e' : 'rgba(255,255,255,0.2)' }} />
                  <span className="text-xs" style={{ color: agent.features[key] ? '#e2e8f0' : 'rgba(255,255,255,0.35)' }}>
                    {FEATURE_LABELS[key]}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent leads */}
          {leads.length > 0 && (
            <Card title={`Leads recientes (${leads.length})`}>
              <div className="flex flex-col gap-2">
                {leads.map((lead: Record<string, string>) => (
                  <div key={lead.id} className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white font-medium">{lead.nombre ?? 'Sin nombre'}</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {new Date(lead.created_at).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    {lead.negocio && <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{lead.negocio} · {lead.giro}</div>}
                    {lead.servicio && <div className="text-xs mt-0.5" style={{ color: '#00e5ff' }}>{lead.servicio}</div>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent calls */}
          <CallsSection calls={calls} timezone={agent.timezone ?? 'America/Monterrey'} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Minutes */}
          <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-xs mb-3 tracking-widest uppercase font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Minutos</div>
            <div className="text-2xl font-bold" style={{ color: minutesColor }}>{agent.minutes_used}</div>
            <div className="text-xs mt-0.5 mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>de {agent.minutes_included} incluidos</div>
            <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${minutesPct}%`, background: minutesColor }} />
            </div>
            <div className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Reset: {new Date(agent.minutes_reset_date + 'T00:00:00').toLocaleDateString('es-MX')}
            </div>
          </div>

          {/* Vapi config */}
          {agent.vapi_agent_id && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-xs mb-2 tracking-widest uppercase font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Vapi Agent ID</div>
              <div className="text-xs font-mono break-all" style={{ color: 'rgba(255,255,255,0.5)' }}>{agent.vapi_agent_id}</div>
            </div>
          )}

          {/* Transfer */}
          {(agent.transfer_whatsapp || agent.transfer_number) && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-xs mb-2 tracking-widest uppercase font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Transferencia</div>
              {agent.transfer_whatsapp && <div className="text-xs text-white">WhatsApp: {agent.transfer_whatsapp}</div>}
              {agent.transfer_number && <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Tel: {agent.transfer_number}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value, icon, link }: { label: string; value: string; icon?: React.ReactNode; link?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <span className="text-xs w-28 flex-shrink-0 pt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      <span className="text-xs text-white flex items-center gap-1.5 flex-1">
        {icon}
        {link ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{value}</a> : value}
      </span>
    </div>
  );
}

