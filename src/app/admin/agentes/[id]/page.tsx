export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Globe, Calendar, CheckCircle, XCircle, Pencil, ExternalLink } from 'lucide-react';
import type { VoiceAgent, VoiceCall } from '@/types/agent';
import { PLAN_LABELS, FEATURE_LABELS } from '@/types/agent';
import AgentActions from './AgentActions';
import CallsSection from './CallsSection';
import LeadsSection from './LeadsSection';
import AdminOrdersSection from './AdminOrdersSection';
import AdminAppointmentsSection from './AdminAppointmentsSection';
import CopyButton from './CopyButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AgentDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: agentData } = await supabase.from('voice_agents').select('*').eq('id', id).single();
  if (!agentData) notFound();

  const agent = agentData as VoiceAgent;
  const features = agent.features ?? {};

  const [{ data: callsData }, { data: leadsData }, { data: ordersData }, { data: apptsData }] = await Promise.all([
    supabase.from('voice_calls').select('*').eq('agent_id', id).order('created_at', { ascending: false }).limit(50),
    supabase.from('leads_voice').select('*').eq('agent_id', id).order('created_at', { ascending: false }).limit(50),
    features.order_taking
      ? supabase.from('orders_voice').select('*').eq('agent_id', id).order('created_at', { ascending: false }).limit(50)
      : Promise.resolve({ data: [] }),
    features.appointment_booking
      ? supabase.from('appointments_voice').select('*').eq('agent_id', id).order('created_at', { ascending: false }).limit(50)
      : Promise.resolve({ data: [] }),
  ]);

  const calls = (callsData ?? []) as VoiceCall[];
  const leads = leadsData ?? [];
  const orders = ordersData ?? [];
  const appts = apptsData ?? [];

  const giro = agent.giro_template ?? 'general';
  const apptLabel = giro === 'restaurante' ? 'reservación' : 'cita';

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
        <Link href="/admin/agentes" className="p-2 rounded-lg hover:bg-[var(--c-surface-2)] transition-colors" style={{ color: 'var(--c-text-3)' }}>
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>{agent.business_name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${planColor}22`, color: planColor, border: `1px solid ${planColor}44` }}>
              {PLAN_LABELS[agent.plan]}
            </span>
            {agent.active
              ? <CheckCircle size={16} color="#22c55e" />
              : <XCircle size={16} color="#ef4444" />}
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--c-text-2)' }}>{agent.client_name}</p>
        </div>
        <Link href={`/admin/agentes/${agent.id}/editar`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity"
          style={{ background: 'var(--c-surface-2)', color: 'var(--c-text-2)', border: '1px solid var(--c-border)' }}>
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
            {agent.business_phone_display && <InfoRow label="Teléfono" value={agent.business_phone_display} icon={<Phone size={13} />} copyable />}
            {agent.phone_number && <InfoRow label="Número Vapi" value={agent.phone_number} icon={<Phone size={13} />} copyable />}
            {agent.calendar_url && <InfoRow label="Calendario" value={agent.calendar_url} icon={<Globe size={13} />} link />}
            <InfoRow label="Zona horaria" value={agent.timezone} icon={<Calendar size={13} />} />
          </Card>

          {/* Features */}
          <Card title="Funcionalidades">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(agent.features) as (keyof typeof agent.features)[]).map(key => (
                <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--c-surface-2)' }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: agent.features[key] ? '#22c55e' : 'var(--c-border-2)' }} />
                  <span className="text-xs" style={{ color: agent.features[key] ? 'var(--c-text)' : 'var(--c-text-3)' }}>
                    {FEATURE_LABELS[key]}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Orders */}
          {features.order_taking && (
            <Card title={`Pedidos (${orders.length})`}>
              <AdminOrdersSection initialOrders={orders as any} token={agent.portal_token ?? ''} />
            </Card>
          )}

          {/* Appointments */}
          {features.appointment_booking && (
            <Card title={`${apptLabel.charAt(0).toUpperCase() + apptLabel.slice(1)}s (${appts.length})`}>
              <AdminAppointmentsSection initialAppointments={appts as any} token={agent.portal_token ?? ''} label={apptLabel} />
            </Card>
          )}

          {/* Leads */}
          {(features.lead_qualification || leads.length > 0) && (
            <LeadsSection initialLeads={leads} />
          )}

          {/* Recent calls */}
          <CallsSection calls={calls} timezone={agent.timezone ?? 'America/Monterrey'} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Minutes */}
          <div className="p-5 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <div className="text-xs mb-3 tracking-widest uppercase font-semibold" style={{ color: 'var(--c-text-3)' }}>Minutos</div>
            <div className="text-2xl font-bold" style={{ color: minutesColor }}>{agent.minutes_used}</div>
            <div className="text-xs mt-0.5 mb-3" style={{ color: 'var(--c-text-2)' }}>de {agent.minutes_included} incluidos</div>
            <div className="w-full h-2 rounded-full" style={{ background: 'var(--c-border)' }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${minutesPct}%`, background: minutesColor }} />
            </div>
            <div className="text-xs mt-2" style={{ color: 'var(--c-text-3)' }}>
              Reset: {new Date(agent.minutes_reset_date + 'T00:00:00').toLocaleDateString('es-MX')}
            </div>
          </div>

          {/* Vapi config */}
          {agent.vapi_agent_id && (
            <div className="p-4 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              <div className="text-xs mb-2 tracking-widest uppercase font-semibold" style={{ color: 'var(--c-text-3)' }}>Vapi Agent ID</div>
              <div className="text-xs font-mono break-all" style={{ color: 'var(--c-text-2)' }}>{agent.vapi_agent_id}</div>
            </div>
          )}

          {/* Portal link */}
          {agent.portal_token && (
            <div className="p-4 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              <div className="text-xs mb-2 tracking-widest uppercase font-semibold" style={{ color: 'var(--c-text-3)' }}>Portal del cliente</div>
              <div className="flex items-center gap-2">
                <a
                  href={`/portal/${agent.portal_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs hover:underline flex-1"
                  style={{ color: '#9B6DFF' }}
                >
                  <ExternalLink size={11} />
                  Ver portal
                </a>
                <CopyButton text={`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/portal/${agent.portal_token}`} />
              </div>
              <div className="text-xs mt-1.5 font-mono break-all" style={{ color: 'var(--c-text-4)' }}>
                /portal/{agent.portal_token?.slice(0, 8)}…
              </div>
            </div>
          )}

          {/* Business hours */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <div className="text-xs mb-2 tracking-widest uppercase font-semibold" style={{ color: 'var(--c-text-3)' }}>Horario de atención</div>
            {agent.business_hours ? (
              <div className="flex flex-col gap-1">
                {(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const).map(day => {
                  const DAY_LABEL: Record<string, string> = { monday:'Lun', tuesday:'Mar', wednesday:'Mié', thursday:'Jue', friday:'Vie', saturday:'Sáb', sunday:'Dom' };
                  const s = (agent.business_hours as any)[day];
                  return (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-xs w-8" style={{ color: 'var(--c-text-3)' }}>{DAY_LABEL[day]}</span>
                      {s?.open
                        ? <span className="text-xs font-medium" style={{ color: 'var(--c-text)' }}>{s.from} – {s.to}</span>
                        : <span className="text-xs" style={{ color: 'var(--c-text-4)' }}>Cerrado</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs" style={{ color: '#22c55e' }}>24/7 — sin restricción de horario</div>
            )}
          </div>

          {/* Transfer */}
          {(agent.transfer_whatsapp || agent.transfer_number) && (
            <div className="p-4 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              <div className="text-xs mb-2 tracking-widest uppercase font-semibold" style={{ color: 'var(--c-text-3)' }}>Transferencia</div>
              {agent.transfer_whatsapp && <div className="text-xs" style={{ color: 'var(--c-text)' }}>WhatsApp: {agent.transfer_whatsapp}</div>}
              {agent.transfer_number && <div className="text-xs mt-1" style={{ color: 'var(--c-text-2)' }}>Tel: {agent.transfer_number}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
      <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value, icon, link, copyable }: { label: string; value: string; icon?: React.ReactNode; link?: boolean; copyable?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b" style={{ borderColor: 'var(--c-divider)' }}>
      <span className="text-xs w-28 flex-shrink-0 pt-0.5" style={{ color: 'var(--c-text-3)' }}>{label}</span>
      <span className="text-xs flex items-center gap-1.5 flex-1 min-w-0" style={{ color: 'var(--c-text)' }}>
        {icon}
        <span className="truncate">
          {link ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{value}</a> : value}
        </span>
        {copyable && <CopyButton text={value} />}
      </span>
    </div>
  );
}
