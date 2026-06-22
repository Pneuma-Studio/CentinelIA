export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Phone, CheckCircle, XCircle, CreditCard, PhoneCall, Users, ShoppingBag, CalendarDays, MessageCircle, Mail, AlertTriangle, ChevronRight } from 'lucide-react';
// Phone, CheckCircle, XCircle still used in Agentes tab and alerts
import type { VoiceCall } from '@/types/agent';
import { MINUTES_PLAN_CONFIG } from '@/lib/billing/plans';
import type { MinutesPlan } from '@/lib/billing/plans';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import type { BusinessHours } from '@/types/agent';
import { cookies } from 'next/headers';
import { verifySession, PORTAL_COOKIE } from '@/lib/portal/auth';
import { redirect } from 'next/navigation';

import PortalLogout            from './PortalLogout';
import PauseResumeButton       from './PauseResumeButton';
import LogoUploader            from './LogoUploader';
import PortalLeadsSection      from './PortalLeadsSection';
import PortalOrdersSection     from './PortalOrdersSection';
import PortalAppointmentsSection from './PortalAppointmentsSection';
import BuyMinutesSection       from './BuyMinutesSection';
import MinutesLedgerSection    from './MinutesLedgerSection';
import BusinessHoursEditor     from './BusinessHoursEditor';
import KnowledgeBaseEditor     from './KnowledgeBaseEditor';
import CallCard                from './CallCard';
import DownloadCallsCSV        from './DownloadCallsCSV';
import ContractSection         from './ContractSection';
import CollapsibleSection      from './CollapsibleSection';

type Tab = 'agentes' | 'resumen' | 'actividad' | 'minutos' | 'configuracion' | 'contrato';

interface Props {
  params:       Promise<{ token: string }>;
  searchParams: Promise<{ tab?: string; period?: string }>;
}

const PLAN_LABELS: Record<string, string> = { basico: 'Básico', estandar: 'Estándar', pro: 'Pro' };
const PLAN_COLORS: Record<string, string> = { basico: '#6b7280', estandar: '#3b82f6', pro: '#a855f7' };

export default async function ClientPortalPage({ params, searchParams }: Props) {
  const { token }          = await params;
  const { tab: tabParam, period } = await searchParams;
  const tab: Tab           = (tabParam as Tab) ?? 'agentes';
  const days               = period ? parseInt(period) : undefined;

  // ── Auth: verify session owns this portal ─────────────────────────────────
  const cookieStore    = await cookies();
  const sessionCookie  = cookieStore.get(PORTAL_COOKIE)?.value ?? '';
  const session        = await verifySession(sessionCookie);

  const supabase = createAdminClient();
  const { data: agent } = await supabase
    .from('voice_agents').select('*').eq('portal_token', token).single();
  if (!agent) notFound();

  // Security: verify this agent belongs to the logged-in client
  if (session?.portalEmail && agent.portal_email && agent.portal_email !== session.portalEmail) {
    redirect('/portal/login');
  }

  // All agents for this client (same portal_email)
  const { data: clientAgents } = session?.portalEmail
    ? await supabase
        .from('voice_agents')
        .select('id, business_name, agent_name, portal_token, active, client_paused, billing_status, plan, phone_number')
        .eq('portal_email', session.portalEmail)
    : { data: [] };
  const allClientAgents = clientAgents ?? [];

  const clientPaused  = (agent as any).client_paused ?? false;
  const billingPaused = !agent.active && agent.billing_status === 'pago_fallido';

  const features   = agent.features ?? {};
  const showLeads  = !!features.lead_qualification;
  const showOrders = !!features.order_taking;
  const showAppts  = !!features.appointment_booking;
  const hasStripe  = !!agent.stripe_customer_id;
  const agentName  = agent.agent_name?.trim() || 'CentinelIA';

  const minutesIncluded = agent.minutes_included ?? 0;
  const minutesUsed     = agent.minutes_used ?? 0;
  const minutesPct      = minutesIncluded > 0 ? Math.min((minutesUsed / minutesIncluded) * 100, 100) : 0;
  const minutesColor    = minutesPct > 90 ? '#ef4444' : minutesPct > 70 ? '#f59e0b' : '#22c55e';
  const minutesRemain   = Math.max(0, minutesIncluded - minutesUsed);
  const planBaseMinutes = agent.minutes_plan ? (MINUTES_PLAN_CONFIG[agent.minutes_plan as MinutesPlan]?.minutes ?? minutesIncluded) : minutesIncluded;
  const rolloverMinutes = Math.max(0, minutesIncluded - planBaseMinutes);
  const resetDate       = agent.minutes_reset_date
    ? new Date(agent.minutes_reset_date + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
    : '—';

  const supportWhatsApp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '';
  const supportEmail    = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'hola@centinelia.mx';

  // ── Data per tab ───────────────────────────────────────────────────────────
  const since = days ? new Date(Date.now() - days * 86400000).toISOString() : undefined;

  const [callsRes, leadsRes, ordersRes, apptsRes, allCallsRes] = await Promise.all([
    // Calls — always needed (resumen + minutos tab for allCalls)
    since
      ? supabase.from('voice_calls').select('*').eq('agent_id', agent.id).gte('created_at', since).order('created_at', { ascending: false }).limit(100)
      : supabase.from('voice_calls').select('*').eq('agent_id', agent.id).order('created_at', { ascending: false }).limit(100),
    showLeads  ? supabase.from('leads_voice').select('*').eq('agent_id', agent.id).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
    showOrders ? supabase.from('orders_voice').select('*').eq('agent_id', agent.id).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
    showAppts  ? supabase.from('appointments_voice').select('*').eq('agent_id', agent.id).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
    supabase.from('voice_calls').select('duration_seconds, created_at').eq('agent_id', agent.id).order('created_at', { ascending: true }),
  ]);

  const calls    = (callsRes.data    ?? []) as VoiceCall[];
  const leads    = leadsRes.data     ?? [];
  const orders   = ordersRes.data    ?? [];
  const appts    = apptsRes.data     ?? [];
  const allCalls = allCallsRes.data  ?? [];

  const totalDuration  = calls.reduce((s, c) => s + (c.duration_seconds ?? 0), 0);
  const totalHours     = (totalDuration / 3600).toFixed(1);
  const avgDuration    = calls.length > 0 ? Math.round(totalDuration / calls.length / 60) : 0;
  const pendingOrders  = orders.filter((o: any) => o.status === 'nuevo' || o.status === 'en_proceso').length;
  const confirmedAppts = appts.filter((a: any) => a.status === 'confirmada').length;
  const isFirstTime    = allCalls.length === 0;

  const allTimeTotalMin = allCalls.reduce((s: number, c: any) => s + Math.ceil((c.duration_seconds ?? 0) / 60), 0);
  const firstCallDate   = allCalls.length > 0 ? new Date((allCalls[0] as any).created_at) : null;
  const daysSinceFirst  = firstCallDate ? Math.max(1, Math.ceil((Date.now() - firstCallDate.getTime()) / 86400000)) : 1;
  const avgMinPerDay    = allCalls.length > 0 ? (allTimeTotalMin / daysSinceFirst).toFixed(1) : '0';
  const avgMinPerWeek   = allCalls.length > 0 ? Math.round(allTimeTotalMin / (daysSinceFirst / 7)) : 0;
  const avgMinPerMonth  = allCalls.length > 0 ? Math.round(allTimeTotalMin / (daysSinceFirst / 30)) : 0;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'agentes',       label: 'Agentes' },
    { id: 'resumen',       label: 'Resumen' },
    { id: 'actividad',     label: 'Actividad' },
    { id: 'minutos',       label: 'Minutos' },
    { id: 'configuracion', label: 'Configuración' },
    { id: 'contrato',      label: 'Contrato' },
  ];

  return (
    <ThemeProvider storageKey="centinelia-portal-theme" defaultTheme="light">
      <div className="min-h-screen" style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}>

        {/* Header */}
        <div style={{ background: 'var(--c-surface)', borderBottom: '1px solid var(--c-border)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              {(agent as any).logo_url
                ? <img src={(agent as any).logo_url} alt={agent.business_name} className="h-8 w-auto object-contain max-w-[160px]" />
                : <h1 className="text-base font-bold truncate" style={{ color: 'var(--c-text)' }}>{agent.business_name}</h1>
              }
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {agent.plan && (() => {
                const pc = PLAN_COLORS[agent.plan] ?? '#6b7280';
                return (
                  <span className="hidden sm:inline-flex items-center text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: `${pc}18`, color: pc, border: `1px solid ${pc}30` }}>
                    {PLAN_LABELS[agent.plan]}
                  </span>
                );
              })()}
              <ThemeToggle className="!text-[var(--c-text-2)] !bg-[var(--c-surface-2)]" />
              {hasStripe && (
                <a href={`/api/billing/portal-session?token=${token}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                  style={{ background: '#6C3BFF', color: '#fff' }}>
                  <CreditCard size={13} /> Suscripción
                </a>
              )}
              <PortalLogout />
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div style={{ background: 'var(--c-surface)', borderBottom: '1px solid var(--c-border)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex gap-0 overflow-x-auto">
              {TABS.map(t => (
                <Link
                  key={t.id}
                  href={`/portal/${token}?tab=${t.id}`}
                  className="px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2"
                  style={{
                    borderColor: tab === t.id ? '#6C3BFF' : 'transparent',
                    color:       tab === t.id ? '#6C3BFF' : 'var(--c-text-3)',
                  }}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(!agent.active || minutesPct > 80) && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 flex flex-col gap-2">
            {billingPaused && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertTriangle size={15} color="#ef4444" className="flex-shrink-0" />
                <p className="text-sm" style={{ color: '#dc2626' }}>
                  Tu agente está pausado por falta de pago. Actualiza tu método de pago o contacta a CentinelIA.
                </p>
              </div>
            )}
            {clientPaused && !billingPaused && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: '#FFF7ED', border: '1px solid rgba(245,158,11,0.3)' }}>
                <AlertTriangle size={15} color="#f59e0b" className="flex-shrink-0" />
                <p className="text-sm" style={{ color: '#92400e' }}>
                  Tu agente está pausado voluntariamente. Puedes reanudarlo cuando quieras desde la pestaña Resumen.
                </p>
              </div>
            )}
            {minutesPct > 80 && agent.active && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.3)' }}>
                <AlertTriangle size={15} color="#f59e0b" className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#92400e' }}>
                    Estás al {Math.round(minutesPct)}% de tus minutos — te quedan {minutesRemain} min
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>Reset el {resetDate}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

          {/* ── AGENTES ──────────────────────────────────────────────────── */}
          {tab === 'agentes' && (
            <div className="flex flex-col gap-3">
              {allClientAgents.length === 0 && (
                <p className="text-sm text-center py-12" style={{ color: 'var(--c-text-3)' }}>Sin agentes asociados</p>
              )}
              {allClientAgents.map((a: any) => {
                const isBillingPaused = !a.active && a.billing_status === 'pago_fallido';
                const isClientPaused  = !!(a.client_paused) && !isBillingPaused;
                const isActive        = a.active;
                const isCurrent       = a.portal_token === token;

                let statusLabel = 'Activo';
                let statusColor = '#16a34a';
                let statusBg    = 'rgba(34,197,94,0.1)';
                if (isBillingPaused) { statusLabel = 'Pausado — pago pendiente'; statusColor = '#dc2626'; statusBg = 'rgba(239,68,68,0.08)'; }
                else if (isClientPaused) { statusLabel = 'Pausado por ti'; statusColor = '#f59e0b'; statusBg = 'rgba(245,158,11,0.1)'; }
                else if (!isActive) { statusLabel = 'Inactivo'; statusColor = '#6b7280'; statusBg = 'rgba(107,114,128,0.1)'; }

                return (
                  <div key={a.id} className="rounded-xl p-5"
                    style={{ background: 'var(--c-surface)', border: `1px solid ${isCurrent ? 'rgba(108,59,255,0.3)' : 'var(--c-border)'}` }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>
                            {a.agent_name?.trim() || 'CentinelIA'}
                          </span>
                          {(() => { const pc = PLAN_COLORS[a.plan] ?? '#6b7280'; return (
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                              style={{ background: `${pc}18`, color: pc, border: `1px solid ${pc}30` }}>
                              {PLAN_LABELS[a.plan] ?? a.plan}
                            </span>
                          ); })()}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>{a.business_name}</p>
                        {a.phone_number && (
                          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--c-text-3)' }}>
                            <Phone size={10} /> {a.phone_number}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium mt-2"
                          style={{ background: statusBg, color: statusColor }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                          {statusLabel}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 items-end flex-shrink-0">
                        {!isCurrent && (
                          <Link href={`/portal/${a.portal_token}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                            style={{ background: 'var(--c-surface-2)', color: 'var(--c-text-2)', border: '1px solid var(--c-border)' }}>
                            <ChevronRight size={12} /> Ver portal
                          </Link>
                        )}
                        {!isBillingPaused && (
                          <PauseResumeButton agentId={a.id} clientPaused={isClientPaused} />
                        )}
                        {isBillingPaused && (
                          <p className="text-xs text-right" style={{ color: '#dc2626', maxWidth: 160 }}>
                            Contacta a CentinelIA para regularizar el pago
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── RESUMEN ──────────────────────────────────────────────────── */}
          {tab === 'resumen' && (
            <div className="flex flex-col gap-5">
              {isFirstTime && (
                <div className="px-5 py-4 rounded-xl"
                  style={{ background: 'rgba(108,59,255,0.06)', border: '1px solid rgba(108,59,255,0.15)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#6C3BFF' }}>¡Tu agente está listo! 🎉</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-2)' }}>
                    Cuando tu número reciba la primera llamada, los registros aparecerán aquí automáticamente.
                  </p>
                </div>
              )}

              {/* KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard icon={<PhoneCall size={16} color="#6C3BFF" />}  value={String(calls.length)}   label="Llamadas" sub={`prom. ${avgDuration} min`} valueColor="#6C3BFF" />
                <KpiCard icon={<span style={{ fontSize: 16 }}>⏱</span>}  value={`${totalHours}h`}       label="Tiempo atendido"  valueColor="var(--c-text)" />
                {showLeads  && <KpiCard icon={<Users size={16} color="#22c55e" />}       value={String(leads.length)}   label="Leads"    sub={`${calls.length > 0 ? Math.round((leads.length / calls.length) * 100) : 0}% conv.`} valueColor="#22c55e" />}
                {showOrders && <KpiCard icon={<ShoppingBag size={16} color="#f59e0b" />} value={String(orders.length)}  label="Pedidos"  sub={`${pendingOrders} pendientes`} valueColor="#f59e0b" />}
                {showAppts  && <KpiCard icon={<CalendarDays size={16} color="#3b82f6" />}value={String(appts.length)}   label="Citas"    sub={`${confirmedAppts} confirmadas`} valueColor="#3b82f6" />}
              </div>

              {/* Period filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>Período:</span>
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                  {[{ label: '7 días', param: '7' }, { label: '30 días', param: '30' }, { label: 'Todo', param: '' }].map(({ label, param }) => {
                    const active = (period ?? '') === param;
                    return (
                      <Link key={param} href={param ? `/portal/${token}?tab=resumen&period=${param}` : `/portal/${token}?tab=resumen`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: active ? '#6C3BFF' : 'transparent', color: active ? '#fff' : 'var(--c-text-3)' }}>
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Recent calls */}
              <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5" style={{ color: 'var(--c-text-3)' }}>
                    <PhoneCall size={13} /> Llamadas recientes {calls.length > 0 && `(${calls.length})`}
                  </h2>
                  <DownloadCallsCSV calls={calls} filename={`llamadas-${agent.business_name.replace(/\s+/g, '-').toLowerCase()}.csv`} />
                </div>
                {calls.length === 0
                  ? <p className="text-sm text-center py-8" style={{ color: 'var(--c-text-3)' }}>Sin llamadas en este período</p>
                  : <div className="flex flex-col gap-2">
                      {calls.slice(0, 30).map(call => <CallCard key={call.id} call={call as any} />)}
                      {calls.length > 30 && <p className="text-xs text-center pt-1" style={{ color: 'var(--c-text-4)' }}>Mostrando 30 de {calls.length}</p>}
                    </div>
                }
              </div>
            </div>
          )}

          {/* ── ACTIVIDAD ────────────────────────────────────────────────── */}
          {tab === 'actividad' && (
            <div className="flex flex-col gap-5">
              {!showLeads && !showOrders && !showAppts ? (
                <div className="text-center py-16 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--c-text-2)' }}>Tu plan no incluye módulos de actividad</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--c-text-3)' }}>Leads, pedidos y citas están disponibles en planes superiores</p>
                </div>
              ) : (
                <>
                  {showOrders && (
                    <CollapsibleSection title="Pedidos" icon={<ShoppingBag size={14} />} defaultOpen={orders.length > 0} count={orders.length}>
                      <PortalOrdersSection initialOrders={orders as any} token={token} />
                    </CollapsibleSection>
                  )}
                  {showAppts && (
                    <CollapsibleSection title="Citas" icon={<CalendarDays size={14} />} defaultOpen={appts.length > 0} count={appts.length}>
                      <PortalAppointmentsSection initialAppointments={appts as any} token={token} label="cita" />
                    </CollapsibleSection>
                  )}
                  {showLeads && (
                    <CollapsibleSection title="Leads" icon={<Users size={14} />} defaultOpen={leads.length > 0} count={leads.length}>
                      <PortalLeadsSection initialLeads={leads as any} token={token}
                        filename={`leads-${agent.business_name.replace(/\s+/g, '-').toLowerCase()}.csv`} />
                    </CollapsibleSection>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── MINUTOS ──────────────────────────────────────────────────── */}
          {tab === 'minutos' && (
            <div className="flex flex-col gap-5">
              {/* Usage card */}
              <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>Uso del mes</h2>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold tabular-nums" style={{ color: minutesColor }}>{minutesUsed}</span>
                  <span className="text-sm mb-1" style={{ color: 'var(--c-text-3)' }}>/ {minutesIncluded} min</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden mb-2" style={{ background: 'var(--c-border)' }}>
                  <div className="h-3 rounded-full transition-all" style={{ width: `${minutesPct}%`, background: minutesColor }} />
                </div>
                <div className="flex justify-between text-xs" style={{ color: 'var(--c-text-3)' }}>
                  <span>{Math.round(minutesPct)}% consumido · {minutesRemain} disponibles</span>
                  <span>Reset: {resetDate}</span>
                </div>
                {rolloverMinutes > 0 && (
                  <p className="text-xs mt-2" style={{ color: '#6C3BFF' }}>
                    {planBaseMinutes} base + {rolloverMinutes} del mes anterior
                  </p>
                )}
              </div>

              {/* Averages */}
              {allCalls.length > 0 && (
                <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                  <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>Consumo promedio</h2>
                  <div className="grid grid-cols-3 gap-3">
                    <StatBox label="Por día"   value={`${avgMinPerDay} min`} />
                    <StatBox label="Por semana" value={`${avgMinPerWeek} min`} />
                    <StatBox label="Por mes"    value={`${avgMinPerMonth} min`} highlight={avgMinPerMonth > minutesIncluded * 0.9} />
                  </div>
                  <p className="text-xs mt-3" style={{ color: 'var(--c-text-4)' }}>Histórico: {allTimeTotalMin} min en {daysSinceFirst} días</p>
                </div>
              )}

              {/* Buy extra */}
              <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <h2 className="text-xs font-semibold mb-1 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>Comprar minutos extra</h2>
                <p className="text-xs mb-4" style={{ color: 'var(--c-text-2)' }}>Se suman al saldo actual al instante. No afectan tu plan mensual.</p>
                <BuyMinutesSection token={token} />
              </div>

              {/* Ledger */}
              <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>Historial de minutos</h2>
                <MinutesLedgerSection agentId={agent.id} minutesIncluded={minutesIncluded} minutesUsed={minutesUsed} />
              </div>
            </div>
          )}

          {/* ── CONFIGURACIÓN ────────────────────────────────────────────── */}
          {tab === 'configuracion' && (
            <div className="flex flex-col gap-5">
              <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>Logo del negocio</h2>
                <LogoUploader token={token} currentUrl={(agent as any).logo_url ?? null} />
              </div>
              <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>Horario de atención</h2>
                <BusinessHoursEditor token={token} initialHours={(agent.business_hours ?? null) as BusinessHours | null} />
              </div>
              <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <h2 className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>Base de conocimiento</h2>
                <KnowledgeBaseEditor token={token} initialValue={agent.knowledge_base ?? ''} />
              </div>
            </div>
          )}

          {/* ── CONTRATO ─────────────────────────────────────────────────── */}
          {tab === 'contrato' && (
            <ContractSection
              token={token}
              businessName={agent.business_name}
              signedAt={agent.contract_accepted_at ?? null}
              contractPreviewUrl={`/portal/${token}/contrato`}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 px-4 sm:px-6 py-4" style={{ borderTop: '1px solid var(--c-border)' }}>
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs" style={{ color: 'var(--c-text-4)' }}>
              Powered by <span style={{ color: '#6C3BFF' }}>CentinelIA</span> · Pneuma Studio
            </span>
            <div className="flex items-center gap-2">
              {supportWhatsApp && (
                <a href={`https://wa.me/${supportWhatsApp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ background: '#22c55e', color: '#fff' }}>
                  <MessageCircle size={12} /> WhatsApp
                </a>
              )}
              <a href={`mailto:${supportEmail}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                style={{ background: 'var(--c-surface)', color: 'var(--c-text-2)', border: '1px solid var(--c-border)' }}>
                <Mail size={12} /> Soporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

function KpiCard({ icon, value, label, sub, valueColor = 'var(--c-text)' }: {
  icon: React.ReactNode; value: string; label: string; sub?: string; valueColor?: string;
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
      <div className="p-1.5 rounded-lg w-fit mb-2" style={{ background: 'var(--c-surface-2)' }}>{icon}</div>
      <div className="text-2xl font-bold" style={{ color: valueColor }}>{value}</div>
      <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--c-text)' }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>{sub}</div>}
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg p-3 text-center" style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border)' }}>
      <div className="text-sm font-bold" style={{ color: highlight ? '#ef4444' : 'var(--c-text)' }}>{value}</div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>{label}</div>
    </div>
  );
}
