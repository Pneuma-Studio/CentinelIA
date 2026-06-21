'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, CheckCircle, XCircle, ExternalLink, Users, Settings } from 'lucide-react';
import { PLAN_LABELS } from '@/types/agent';
import type { Plan } from '@/types/agent';

const PLAN_COLORS: Record<string, string> = {
  basico: '#6b7280', estandar: '#3b82f6', pro: '#a855f7',
};

type AgentRow = {
  id: string;
  business_name: string;
  plan: string;
  active: boolean;
  billing_status: string | null;
  minutes_used: number;
  minutes_included: number;
};

type ClientGroup = {
  key: string;
  client_name: string;
  client_email: string | null;
  portal_email: string | null;
  agents: AgentRow[];
};

export default function ClientesClient({ clients }: { clients: ClientGroup[] }) {
  const [search, setSearch]       = useState('');
  const [expanded, setExpanded]   = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return clients;
    return clients.filter(c =>
      c.client_name.toLowerCase().includes(q) ||
      c.client_email?.toLowerCase().includes(q) ||
      c.agents.some(a => a.business_name.toLowerCase().includes(q))
    );
  }, [clients, search]);

  const toggle = (key: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const totalAgents  = clients.reduce((s, c) => s + c.agents.length, 0);
  const totalActive  = clients.reduce((s, c) => s + c.agents.filter(a => a.active).length, 0);

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>Clientes</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--c-text-3)' }}>
          {clients.length} clientes · {totalAgents} agentes · {totalActive} activos
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--c-text-3)' }} />
        <input
          type="text"
          placeholder="Buscar por cliente, email o negocio…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
        />
      </div>

      {/* Client list */}
      <div className="flex flex-col gap-3">
        {filtered.map(client => {
          const open         = expanded.has(client.key);
          const activeCount  = client.agents.filter(a => a.active).length;
          const pausedCount  = client.agents.length - activeCount;
          const initials     = client.client_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

          return (
            <div key={client.key} className="rounded-xl overflow-hidden"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>

              {/* Client header — clickable to expand */}
              <button
                onClick={() => toggle(client.key)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--c-surface-2)]"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{ background: 'rgba(108,59,255,0.15)', color: '#9B6DFF' }}>
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>{client.client_name}</span>
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--c-surface-2)', color: 'var(--c-text-3)' }}>
                      <Users size={10} /> {client.agents.length} {client.agents.length === 1 ? 'agente' : 'agentes'}
                    </span>
                    {activeCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                        {activeCount} activo{activeCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {pausedCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
                        {pausedCount} pausado{pausedCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {client.client_email && (
                      <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>{client.client_email}</span>
                    )}
                    {client.portal_email && (
                      <span className="text-xs" style={{ color: 'var(--c-text-4)' }}>
                        Portal: {client.portal_email}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronDown size={15} className="flex-shrink-0 transition-transform"
                  style={{ color: 'var(--c-text-3)', transform: open ? 'rotate(180deg)' : undefined }} />
              </button>

              {/* Agent list */}
              {open && (
                <div style={{ borderTop: '1px solid var(--c-divider)' }}>
                  {client.agents.map((agent, i) => {
                    const planColor = PLAN_COLORS[agent.plan] ?? '#6b7280';
                    const pct       = agent.minutes_included > 0
                      ? Math.round((agent.minutes_used / agent.minutes_included) * 100)
                      : 0;

                    return (
                      <div key={agent.id}
                        className="flex items-center gap-3 px-5 py-3"
                        style={{ borderTop: i > 0 ? '1px solid var(--c-divider)' : undefined, background: 'var(--c-surface-2)' }}>

                        {/* Status dot */}
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: agent.active ? '#22c55e' : '#ef4444' }} />

                        {/* Business info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{agent.business_name}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                              style={{ background: `${planColor}18`, color: planColor, border: `1px solid ${planColor}30` }}>
                              {PLAN_LABELS[agent.plan as Plan] ?? agent.plan}
                            </span>
                            {!agent.active && agent.billing_status === 'pago_fallido' && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full"
                                style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
                                Pago fallido
                              </span>
                            )}
                          </div>
                          {/* Minutes mini-bar */}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 max-w-[80px] h-1 rounded-full" style={{ background: 'var(--c-border)' }}>
                              <div className="h-1 rounded-full"
                                style={{ width: `${Math.min(pct, 100)}%`, background: pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e' }} />
                            </div>
                            <span className="text-xs tabular-nums" style={{ color: 'var(--c-text-4)' }}>
                              {agent.minutes_used}/{agent.minutes_included} min
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Link href={`/admin/agentes/${agent.id}`}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                            style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text-2)' }}>
                            <ExternalLink size={11} /> Ver
                          </Link>
                          <Link href={`/admin/agentes/${agent.id}/editar`}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                            style={{ background: 'rgba(108,59,255,0.08)', color: '#9B6DFF', border: '1px solid rgba(108,59,255,0.2)' }}>
                            <Settings size={11} /> Editar
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--c-text-3)' }}>
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{clients.length === 0 ? 'Sin clientes registrados' : 'Sin resultados'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
