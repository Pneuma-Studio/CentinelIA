import { createAdminClient } from '@/lib/supabase/admin';
import { PhoneCall, Clock, TrendingUp, Users } from 'lucide-react';
import type { VoiceAgent, VoiceCall } from '@/types/agent';

export default async function DashboardPage() {
  const supabase = createAdminClient();

  const [{ data: agents }, { data: calls }] = await Promise.all([
    supabase.from('voice_agents').select('*').eq('active', true),
    supabase.from('voice_calls').select('*').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const agentList = (agents ?? []) as VoiceAgent[];
  const callList  = (calls ?? []) as VoiceCall[];

  const totalMinutes = callList.reduce((s, c) => s + Math.ceil(c.duration_seconds / 60), 0);
  const leadsCreated = callList.filter(c => c.lead_created).length;
  const apptBooked   = callList.filter(c => c.appointment_created).length;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Últimos 30 días</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={<Users size={18} />} label="Agentes activos" value={agentList.length} />
        <StatCard icon={<PhoneCall size={18} />} label="Llamadas" value={callList.length} />
        <StatCard icon={<Clock size={18} />} label="Minutos usados" value={totalMinutes} />
        <StatCard icon={<TrendingUp size={18} />} label="Leads generados" value={leadsCreated + apptBooked} />
      </div>

      {/* Recent calls */}
      <h2 className="text-sm font-semibold mb-4 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Llamadas recientes
      </h2>
      <div className="flex flex-col gap-2">
        {callList.slice(0, 10).map(call => (
          <div key={call.id} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div className="text-sm text-white">{call.caller_number || 'Número desconocido'}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {new Date(call.created_at).toLocaleString('es-MX', { timeZone: 'America/Monterrey' })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <OutcomeBadge outcome={call.outcome} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {Math.ceil(call.duration_seconds / 60)} min
              </span>
            </div>
          </div>
        ))}
        {callList.length === 0 && (
          <p className="text-sm py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Sin llamadas en los últimos 30 días
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2 mb-3" style={{ color: '#00e5ff' }}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
      <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
    </div>
  );
}

const OUTCOME_LABELS: Record<string, { label: string; color: string }> = {
  lead_created:        { label: 'Lead',       color: '#22c55e' },
  appointment_booked:  { label: 'Cita',        color: '#3b82f6' },
  order_taken:         { label: 'Pedido',      color: '#f59e0b' },
  transferred:         { label: 'Transferido', color: '#a855f7' },
  info_provided:       { label: 'Información', color: '#6b7280' },
  escalated_whatsapp:  { label: 'WhatsApp',    color: '#25D366' },
  other:               { label: 'Otro',        color: '#4b5563' },
};

function OutcomeBadge({ outcome }: { outcome: string }) {
  const o = OUTCOME_LABELS[outcome] ?? OUTCOME_LABELS.other;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${o.color}22`, color: o.color }}>
      {o.label}
    </span>
  );
}
