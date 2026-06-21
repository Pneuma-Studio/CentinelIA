export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Phone, CheckCircle, XCircle, AlertTriangle, CreditCard, Zap, Clock, PhoneCall, Users, ShoppingBag, CalendarDays, MessageCircle, Mail } from 'lucide-react';
import type { VoiceCall } from '@/types/agent';
import PortalLeadsSection from './PortalLeadsSection';
import PortalOrdersSection from './PortalOrdersSection';
import PortalAppointmentsSection from './PortalAppointmentsSection';
import BuyMinutesSection from './BuyMinutesSection';
import CollapsibleSection from './CollapsibleSection';
import BusinessHoursEditor from './BusinessHoursEditor';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import type { BusinessHours } from '@/types/agent';

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ period?: string }>;
}

const PLAN_LABELS: Record<string, string> = { basico: 'Básico', estandar: 'Estándar', pro: 'Pro' };

const OUTCOME_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  lead_created:       { label: 'Lead',        color: '#6C3BFF', bg: '#F0ECFF' },
  appointment_booked: { label: 'Cita',         color: '#3b82f6', bg: '#EFF6FF' },
  order_taken:        { label: 'Pedido',       color: '#f59e0b', bg: '#FFFBEB' },
  transferred:        { label: 'Transferido',  color: '#a855f7', bg: '#FAF5FF' },
  info_provided:      { label: 'Información',  color: '#6b7280', bg: '#F9FAFB' },
  escalated_whatsapp: { label: 'WhatsApp',     color: '#16a34a', bg: '#F0FDF4' },
  other:              { label: 'Otro',         color: '#9ca3af', bg: '#F3F4F6' },
};

const GIRO_LABELS: Record<string, { appointment?: string }> = {
  consultorio: { appointment: 'cita' },
  estetica:    { appointment: 'cita' },
  restaurante: { appointment: 'reservación' },
  retail:      { appointment: 'cita' },
  agencia:     { appointment: 'cita' },
  general:     { appointment: 'cita' },
};

export default async function ClientPortalPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { period } = await searchParams;
  const days = period ? parseInt(period) : undefined;

  const supabase = createAdminClient();
  const { data: agentData } = await supabase
    .from('voice_agents').select('*').eq('portal_token', token).single();

  if (!agentData) notFound();

  const features    = agentData.features ?? {};
  const showLeads   = !!features.lead_qualification;
  const showOrders  = !!features.order_taking;
  const showAppts   = !!features.appointment_booking;
  const giro        = agentData.giro_template ?? 'general';
  const apptLabel   = GIRO_LABELS[giro]?.appointment ?? 'cita';
  const since       = days ? new Date(Date.now() - days * 86400000).toISOString() : undefined;

  const [callsRes, leadsRes, ordersRes, apptsRes, allCallsRes] = await Promise.all([
    since
      ? supabase.from('voice_calls').select('*').eq('agent_id', agentData.id).gte('created_at', since).order('created_at', { ascending: false }).limit(100)
      : supabase.from('voice_calls').select('*').eq('agent_id', agentData.id).order('created_at', { ascending: false }).limit(100),
    showLeads
      ? supabase.from('leads_voice').select('*').eq('agent_id', agentData.id).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    showOrders
      ? supabase.from('orders_voice').select('*').eq('agent_id', agentData.id).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    showAppts
      ? supabase.from('appointments_voice').select('*').eq('agent_id', agentData.id).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase.from('voice_calls').select('duration_seconds, created_at').eq('agent_id', agentData.id).order('created_at', { ascending: true }),
  ]);

  const calls    = (callsRes.data    ?? []) as VoiceCall[];
  const leads    = leadsRes.data     ?? [];
  const orders   = ordersRes.data    ?? [];
  const appts    = apptsRes.data     ?? [];
  const allCalls = allCallsRes.data  ?? [];

  const totalDuration  = calls.reduce((s, c) => s + (c.duration_seconds ?? 0), 0);
  const totalHours     = (totalDuration / 3600).toFixed(1);
  const avgDuration    = calls.length > 0 ? Math.round(totalDuration / calls.length / 60) : 0;
  const primaryCount   = showOrders ? orders.length : showLeads ? leads.length : showAppts ? appts.length : 0;
  const pendingOrders  = orders.filter((o: any) => o.status === 'nuevo' || o.status === 'en_proceso').length;
  const confirmedAppts = appts.filter((a: any) => a.status === 'confirmada').length;

  const minutesIncluded = agentData.minutes_included ?? 0;
  const minutesUsed     = agentData.minutes_used ?? 0;
  const minutesPct      = minutesIncluded > 0 ? Math.min((minutesUsed / minutesIncluded) * 100, 100) : 0;
  const minutesColor    = minutesPct > 90 ? '#ef4444' : minutesPct > 70 ? '#f59e0b' : '#22c55e';
  const minutesBarBg    = minutesPct > 90 ? '#FEF2F2' : minutesPct > 70 ? '#FFFBEB' : '#F0FDF4';
  const minutesRemain   = Math.max(0, minutesIncluded - minutesUsed);
  const agentName       = agentData.agent_name?.trim() || 'CentinelIA';

  const resetDate = agentData.minutes_reset_date
    ? new Date(agentData.minutes_reset_date + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
    : '—';

  const allTimeTotalMin = allCalls.reduce((s: number, c: any) => s + Math.ceil((c.duration_seconds ?? 0) / 60), 0);
  const firstCallDate   = allCalls.length > 0 ? new Date((allCalls[0] as any).created_at) : null;
  const daysSinceFirst  = firstCallDate ? Math.max(1, Math.ceil((Date.now() - firstCallDate.getTime()) / 86400000)) : 1;
  const avgMinPerDay    = allCalls.length > 0 ? (allTimeTotalMin / daysSinceFirst).toFixed(1) : '0';
  const avgMinPerWeek   = allCalls.length > 0 ? Math.round(allTimeTotalMin / (daysSinceFirst / 7)) : 0;
  const avgMinPerMonth  = allCalls.length > 0 ? Math.round(allTimeTotalMin / (daysSinceFirst / 30)) : 0;

  const hasStripe   = !!agentData.stripe_customer_id;
  const isFirstTime = allCalls.length === 0;

  const kpiCards = buildKpiCards({ showOrders, showLeads, showAppts, calls, leads, orders, appts, totalHours, avgDuration, pendingOrders, confirmedAppts });

  const supportWhatsApp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '';
  const supportEmail    = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'hola@centinelia.mx';

  return (
    <ThemeProvider storageKey="centinelia-portal-theme" defaultTheme="light">
      <div className="min-h-screen" style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}>

        {/* Header */}
        <div style={{ background: 'var(--c-surface)', borderBottom: '1px solid var(--c-border)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--c-text)' }}>{agentData.business_name}</h1>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                {agentData.active
                  ? <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#16a34a' }}><CheckCircle size={12} /> {agentName} activo</span>
                  : <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#ef4444' }}><XCircle size={12} /> {agentName} pausado</span>}
                {agentData.phone_number && (
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--c-text-3)' }}>
                    <Phone size={11} /> {agentData.phone_number}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle className="!text-[var(--c-text-2)] !bg-[var(--c-surface-2)]" />
              {hasStripe && (
                <a href={`/api/billing/portal-session?token=${token}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: '#6C3BFF', color: '#fff' }}>
                  <CreditCard size={14} /> Suscripción
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

          {/* Alerts */}
          {!agentData.active && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
              style={{ background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertTriangle size={16} color="#ef4444" className="flex-shrink-0" />
              <p className="text-sm" style={{ color: '#dc2626' }}>Tu agente está pausado. Contacta a tu asesor de CentinelIA para reactivarlo.</p>
            </div>
          )}
          {minutesPct > 80 && agentData.active && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-4"
              style={{ background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.3)' }}>
              <AlertTriangle size={16} color="#f59e0b" className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#92400e' }}>Estás al {Math.round(minutesPct)}% de tus minutos del mes</p>
                <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>Te quedan {minutesRemain} minutos. Reset el {resetDate}.</p>
              </div>
            </div>
          )}

          {/* First-time onboarding */}
          {isFirstTime && (
            <div className="px-5 py-4 rounded-xl mb-4"
              style={{ background: 'rgba(108,59,255,0.06)', border: '1px solid rgba(108,59,255,0.15)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#6C3BFF' }}>¡Tu agente está listo! 🎉</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-2)' }}>
                Cuando tu número reciba la primera llamada, los registros aparecerán aquí automáticamente. Comparte el número con tus clientes para empezar.
              </p>
            </div>
          )}

          {/* Period filter (for calls view) */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs font-medium" style={{ color: 'var(--c-text-3)' }}>Llamadas:</span>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              {[{ label: '7 días', param: '7' }, { label: '30 días', param: '30' }, { label: 'Todo', param: '' }].map(({ label, param }) => {
                const active = (period ?? '') === param;
                return (
                  <Link key={param} href={param ? `/portal/${token}?period=${param}` : `/portal/${token}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: active ? '#6C3BFF' : 'transparent', color: active ? '#fff' : 'var(--c-text-3)' }}>
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Grid: sidebar first on mobile (order-first), right on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* RIGHT sidebar — shown first on mobile */}
            <div className="flex flex-col gap-4 order-first lg:order-last">

              {/* Minutes */}
              <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <h3 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>Minutos del mes</h3>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-3xl font-bold" style={{ color: minutesColor }}>{minutesUsed}</span>
                  <span className="text-sm mb-1" style={{ color: 'var(--c-text-3)' }}>/ {minutesIncluded}</span>
                </div>
                <div className="w-full h-2.5 rounded-full mb-1" style={{ background: minutesBarBg }}>
                  <div className="h-2.5 rounded-full transition-all" style={{ width: `${minutesPct}%`, background: minutesColor }} />
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--c-text-3)' }}>
                  <span>{Math.round(minutesPct)}% usado</span>
                  <span>Reset: {resetDate}</span>
                </div>
                {hasStripe && (
                  <a href={`/api/billing/portal-session?token=${token}`}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{
                      background: minutesPct > 70 ? '#6C3BFF' : 'var(--c-surface-2)',
                      color: minutesPct > 70 ? '#fff' : '#6C3BFF',
                      border: minutesPct > 70 ? 'none' : '1px solid rgba(108,59,255,0.2)',
                    }}>
                    <CreditCard size={14} />
                    {minutesPct > 70 ? 'Agregar minutos' : 'Gestionar plan'}
                  </a>
                )}
              </div>

              {/* Buy extra minutes */}
              <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <h3 className="text-xs font-semibold mb-1 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>Minutos extra</h3>
                <p className="text-xs mb-4" style={{ color: 'var(--c-text-2)' }}>Se suman al saldo actual al instante. No afectan tu plan mensual.</p>
                <BuyMinutesSection token={token} />
              </div>

              {/* Usage averages */}
              {allCalls.length > 0 && (
                <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                  <h3 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>Consumo promedio</h3>
                  <div className="flex flex-col gap-3">
                    <UsageRow label="Por día"   value={`${avgMinPerDay} min`} />
                    <UsageRow label="Por semana" value={`${avgMinPerWeek} min`} />
                    <UsageRow label="Por mes"    value={`${avgMinPerMonth} min`} highlight={avgMinPerMonth > minutesIncluded * 0.9} />
                  </div>
                  <p className="text-xs mt-3" style={{ color: 'var(--c-text-4)' }}>Histórico · {allTimeTotalMin} min en {daysSinceFirst} días</p>
                </div>
              )}

              {/* Plan info */}
              {agentData.plan && (
                <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                  <h3 className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>Tu plan</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{PLAN_LABELS[agentData.plan] ?? agentData.plan}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(108,59,255,0.08)', color: '#6C3BFF' }}>{minutesIncluded} min/mes</span>
                  </div>
                  {hasStripe && (
                    <a href={`/api/billing/portal-session?token=${token}`}
                      className="text-xs mt-3 flex items-center gap-1 hover:underline" style={{ color: '#6C3BFF' }}>
                      Ver facturas y pagos →
                    </a>
                  )}
                </div>
              )}

              {/* Business hours editor */}
              <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <h3 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>Horario de atención</h3>
                <BusinessHoursEditor token={token} initialHours={(agentData.business_hours ?? null) as BusinessHours | null} />
              </div>

              {/* Help / Support */}
              <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <h3 className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>¿Necesitas ayuda?</h3>
                <p className="text-xs mb-3" style={{ color: 'var(--c-text-2)' }}>Nuestro equipo te ayuda con cualquier duda sobre tu agente.</p>
                <div className="flex flex-col gap-2">
                  {supportWhatsApp && (
                    <a href={`https://wa.me/${supportWhatsApp.replace(/\D/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                      style={{ background: '#22c55e', color: '#fff' }}>
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  )}
                  <a href={`mailto:${supportEmail}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ background: 'var(--c-surface-2)', color: 'var(--c-text)', border: '1px solid var(--c-border)' }}>
                    <Mail size={14} /> {supportEmail}
                  </a>
                </div>
              </div>
            </div>

            {/* LEFT: main content */}
            <div className="lg:col-span-2 flex flex-col gap-5 order-last lg:order-first">

              {/* KPI grid */}
              <div className="grid grid-cols-2 gap-3">
                {kpiCards.map((card, i) => (
                  <KpiCard key={i} icon={card.icon} value={card.value} label={card.label} sub={card.sub} valueColor={card.color} />
                ))}
              </div>

              {/* Orders */}
              {showOrders && (
                <CollapsibleSection
                  title="Pedidos"
                  icon={<ShoppingBag size={14} />}
                  defaultOpen={orders.length > 0}
                  count={orders.length}
                >
                  <PortalOrdersSection initialOrders={orders as any} token={token} />
                </CollapsibleSection>
              )}

              {/* Appointments */}
              {showAppts && (
                <CollapsibleSection
                  title={`${apptLabel.charAt(0).toUpperCase() + apptLabel.slice(1)}s`}
                  icon={<CalendarDays size={14} />}
                  defaultOpen={appts.length > 0}
                  count={appts.length}
                >
                  <PortalAppointmentsSection initialAppointments={appts as any} token={token} label={apptLabel} />
                </CollapsibleSection>
              )}

              {/* Leads */}
              {showLeads && (
                <CollapsibleSection
                  title="Leads"
                  icon={<Users size={14} />}
                  defaultOpen={leads.length > 0}
                  count={leads.length}
                >
                  <PortalLeadsSection
                    initialLeads={leads as any}
                    token={token}
                    filename={`leads-${agentData.business_name.replace(/\s+/g, '-').toLowerCase()}.csv`}
                  />
                </CollapsibleSection>
              )}

              {/* Calls */}
              <Section title={`Llamadas recientes${calls.length > 0 ? ` (${calls.length})` : ''}`} icon={<PhoneCall size={14} />}>
                {calls.length === 0 ? (
                  <div className="text-center py-8 text-sm" style={{ color: 'var(--c-text-3)' }}>
                    Sin llamadas en este período
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {calls.slice(0, 30).map(call => {
                      const outcome = OUTCOME_LABELS[call.outcome] ?? OUTCOME_LABELS.other;
                      return (
                        <div key={call.id} className="px-4 py-3 rounded-xl"
                          style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border)' }}>
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{call.caller_number || 'Número desconocido'}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                                style={{ background: outcome.bg, color: outcome.color }}>{outcome.label}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs flex-shrink-0" style={{ color: 'var(--c-text-3)' }}>
                              <span>{Math.ceil(call.duration_seconds / 60)} min</span>
                              <span>{new Date(call.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                            </div>
                          </div>
                          {call.summary && <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--c-text-2)' }}>{call.summary}</p>}
                        </div>
                      );
                    })}
                    {calls.length > 30 && (
                      <p className="text-xs text-center pt-1" style={{ color: 'var(--c-text-4)' }}>Mostrando 30 de {calls.length} llamadas</p>
                    )}
                  </div>
                )}
              </Section>
            </div>

          </div>
        </div>

        <div className="mt-6 px-6 py-4 text-center" style={{ borderTop: '1px solid var(--c-border)' }}>
          <span className="text-xs" style={{ color: 'var(--c-text-4)' }}>
            Powered by <span style={{ color: '#6C3BFF' }}>CentinelIA</span> · Pneuma Studio
          </span>
        </div>
      </div>
    </ThemeProvider>
  );
}

// ── Adaptive KPIs ─────────────────────────────────────────────────────────

function buildKpiCards({ showOrders, showLeads, showAppts, calls, leads, orders, appts, totalHours, avgDuration, pendingOrders, confirmedAppts }: any) {
  const cards: any[] = [];

  if (showOrders)  cards.push({ icon: <ShoppingBag size={16} color="#f59e0b" />, value: String(orders.length), label: 'Pedidos recibidos', sub: `${pendingOrders} pendientes`, color: '#f59e0b' });
  if (showAppts)   cards.push({ icon: <CalendarDays size={16} color="#3b82f6" />, value: String(appts.length), label: 'Citas agendadas', sub: `${confirmedAppts} confirmadas`, color: '#3b82f6' });
  if (showLeads) {
    const conv = calls.length > 0 ? Math.round((leads.length / calls.length) * 100) : 0;
    cards.push({ icon: <Users size={16} color="#22c55e" />, value: String(leads.length), label: 'Leads capturados', sub: `${conv}% conversión`, color: '#22c55e' });
  }

  cards.push({ icon: <PhoneCall size={16} color="#6C3BFF" />, value: String(calls.length), label: 'Llamadas atendidas', sub: `prom. ${avgDuration} min`, color: '#6C3BFF' });
  cards.push({ icon: <Clock size={16} color="#a855f7" />, value: `${totalHours}h`, label: 'Horas de atención', sub: 'tiempo manejado', color: '#a855f7' });

  return cards.slice(0, 4);
}

// ── Sub-components ────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
      <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase flex items-center gap-1.5"
        style={{ color: 'var(--c-text-3)' }}>
        {icon}{title}
      </h2>
      {children}
    </div>
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

function UsageRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: 'var(--c-text-2)' }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: highlight ? '#ef4444' : 'var(--c-text)' }}>{value}</span>
    </div>
  );
}
