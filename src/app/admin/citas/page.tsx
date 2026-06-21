export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  confirmada: { label: 'Confirmada', color: '#3b82f6' },
  completada: { label: 'Completada', color: '#22c55e' },
  cancelada:  { label: 'Cancelada',  color: '#6b7280' },
  no_asistio: { label: 'No asistió', color: '#f87171' },
};

export default async function CitasPage() {
  const supabase = createAdminClient();

  const [{ data: appts }, { data: agents }] = await Promise.all([
    supabase.from('appointments_voice').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('voice_agents').select('id, business_name, giro_template'),
  ]);

  const agentMap: Record<string, { name: string; giro: string }> = {};
  for (const a of agents ?? []) agentMap[a.id] = { name: a.business_name, giro: a.giro_template ?? 'general' };

  const list = appts ?? [];
  const byStatus: Record<string, number> = {};
  for (const a of list) byStatus[a.status ?? 'confirmada'] = (byStatus[a.status ?? 'confirmada'] ?? 0) + 1;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>Citas y Reservaciones</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--c-text-3)' }}>
          {list.length} registro{list.length !== 1 ? 's' : ''} · todos los agentes
        </p>
      </div>

      {/* Status summary */}
      <div className="flex gap-2 flex-wrap mb-6">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
            {cfg.label}
            <span className="font-bold">{byStatus[key] ?? 0}</span>
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-24" style={{ color: 'var(--c-text-3)' }}>
          <CalendarDays size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Sin citas registradas aún</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map(appt => {
            const sc = STATUS_CONFIG[appt.status ?? 'confirmada'] ?? STATUS_CONFIG.confirmada;
            const agent = agentMap[appt.agent_id];
            const label = agent?.giro === 'restaurante' ? 'Reservación' : 'Cita';
            return (
              <Link key={appt.id} href={`/admin/agentes/${appt.agent_id}`}
                className="px-4 py-3 rounded-xl transition-all hover:opacity-90"
                style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>{appt.nombre ?? 'Sin nombre'}</span>
                      {appt.telefono && <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>· {appt.telefono}</span>}
                      <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: 'var(--c-surface-2)', color: 'var(--c-text-2)' }}>{label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: `${sc.color}18`, color: sc.color }}>{sc.label}</span>
                    </div>
                    {appt.servicio && <p className="text-sm mt-1 font-medium" style={{ color: '#9B6DFF' }}>{appt.servicio}</p>}
                    {(appt.fecha || appt.hora) && (
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--c-text-3)' }}>
                        <CalendarDays size={10} />
                        {appt.fecha ?? ''}{appt.hora ? ` · ${appt.hora}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-medium" style={{ color: '#9B6DFF' }}>{agent?.name ?? ''}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--c-text-4)' }}>
                      {new Date(appt.created_at).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
