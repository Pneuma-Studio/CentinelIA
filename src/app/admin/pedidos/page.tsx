export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { ShoppingBag, Truck, Store } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  nuevo:      { label: 'Nuevo',      color: '#9B6DFF' },
  en_proceso: { label: 'En proceso', color: '#3b82f6' },
  listo:      { label: 'Listo',      color: '#f59e0b' },
  entregado:  { label: 'Entregado',  color: '#22c55e' },
  cancelado:  { label: 'Cancelado',  color: '#6b7280' },
};

export default async function PedidosPage() {
  const supabase = createAdminClient();

  const [{ data: orders }, { data: agents }] = await Promise.all([
    supabase.from('orders_voice').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('voice_agents').select('id, business_name'),
  ]);

  const agentMap: Record<string, string> = {};
  for (const a of agents ?? []) agentMap[a.id] = a.business_name;

  const list = orders ?? [];
  const byStatus: Record<string, number> = {};
  for (const o of list) byStatus[o.status ?? 'nuevo'] = (byStatus[o.status ?? 'nuevo'] ?? 0) + 1;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>Pedidos</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--c-text-3)' }}>
          {list.length} pedido{list.length !== 1 ? 's' : ''} · todos los agentes
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
          <ShoppingBag size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Sin pedidos registrados aún</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map(order => {
            const sc = STATUS_CONFIG[order.status ?? 'nuevo'] ?? STATUS_CONFIG.nuevo;
            return (
              <Link key={order.id} href={`/admin/agentes/${order.agent_id}`}
                className="px-4 py-3 rounded-xl transition-all hover:opacity-90"
                style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>{order.nombre ?? 'Sin nombre'}</span>
                      {order.telefono && <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>· {order.telefono}</span>}
                      <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: 'var(--c-surface-2)', color: 'var(--c-text-2)' }}>
                        {order.tipo === 'entrega' ? <Truck size={9} /> : <Store size={9} />}
                        {order.tipo === 'entrega' ? 'Entrega' : 'Recoger'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: `${sc.color}18`, color: sc.color }}>{sc.label}</span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--c-text-2)' }}>{order.items}</p>
                    {order.direccion && <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>📍 {order.direccion}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-medium" style={{ color: '#9B6DFF' }}>{agentMap[order.agent_id] ?? ''}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--c-text-4)' }}>
                      {new Date(order.created_at).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
