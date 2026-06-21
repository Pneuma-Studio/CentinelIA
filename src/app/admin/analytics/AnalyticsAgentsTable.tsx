'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

export interface AgentRow {
  id: string;
  business_name: string;
  plan: string;
  active: boolean;
  mxn: number;
  calls: number;
  leads: number;
  avgMin: number;
  minutesUsed: number;
}

const PLAN_META: Record<string, { label: string; color: string }> = {
  basico:   { label: 'Básico',   color: '#6b7280' },
  estandar: { label: 'Estándar', color: '#3b82f6' },
  pro:      { label: 'Pro',      color: '#a855f7' },
};

type TierFilter   = 'todos' | 'basico' | 'estandar' | 'pro';
type StatusFilter = 'todos' | 'activos' | 'pausados';

export default function AnalyticsAgentsTable({ rows }: { rows: AgentRow[] }) {
  const [search, setSearch]   = useState('');
  const [tier, setTier]       = useState<TierFilter>('todos');
  const [status, setStatus]   = useState<StatusFilter>('todos');

  const filtered = useMemo(() => {
    let result = rows;
    if (tier !== 'todos')            result = result.filter(r => r.plan === tier);
    if (status === 'activos')        result = result.filter(r => r.active);
    if (status === 'pausados')       result = result.filter(r => !r.active);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r => r.business_name.toLowerCase().includes(q));
    }
    return result;
  }, [rows, tier, status, search]);

  const counts = {
    basico:   rows.filter(r => r.plan === 'basico').length,
    estandar: rows.filter(r => r.plan === 'estandar').length,
    pro:      rows.filter(r => r.plan === 'pro').length,
    activos:  rows.filter(r => r.active).length,
    pausados: rows.filter(r => !r.active).length,
  };

  if (rows.length === 0) {
    return <p className="text-sm py-4 text-center" style={{ color: 'var(--c-text-3)' }}>Sin agentes</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Filters row */}
      <div className="flex flex-col gap-2">
        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-text-3)' }} />
          <input
            type="text"
            placeholder="Buscar agente…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs outline-none"
            style={{
              background: 'var(--c-input-bg)',
              border: '1px solid var(--c-input-border)',
              color: 'var(--c-text)',
            }}
          />
        </div>

        {/* Tier + status filters */}
        <div className="flex gap-2 flex-wrap">
          <FilterGroup>
            {([
              { key: 'todos',    label: `Todos (${rows.length})`,          color: undefined },
              { key: 'basico',   label: `Básico (${counts.basico})`,       color: '#6b7280' },
              { key: 'estandar', label: `Estándar (${counts.estandar})`,   color: '#3b82f6' },
              { key: 'pro',      label: `Pro (${counts.pro})`,             color: '#a855f7' },
            ] as { key: TierFilter; label: string; color?: string }[]).map(({ key, label, color }) => (
              <FilterBtn
                key={key}
                active={tier === key}
                color={color}
                onClick={() => setTier(key)}
              >
                {label}
              </FilterBtn>
            ))}
          </FilterGroup>

          <FilterGroup>
            {([
              { key: 'todos',    label: `Todos` },
              { key: 'activos',  label: `Activos (${counts.activos})`,   dot: '#22c55e' },
              { key: 'pausados', label: `Pausados (${counts.pausados})`, dot: '#6b7280' },
            ] as { key: StatusFilter; label: string; dot?: string }[]).map(({ key, label, dot }) => (
              <FilterBtn
                key={key}
                active={status === key}
                onClick={() => setStatus(key)}
              >
                {dot && <span className="w-1.5 h-1.5 rounded-full inline-block mr-1" style={{ background: dot }} />}
                {label}
              </FilterBtn>
            ))}
          </FilterGroup>
        </div>
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <p className="text-xs py-3 text-center" style={{ color: 'var(--c-text-3)' }}>Sin resultados</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtered.map(row => {
            const meta = PLAN_META[row.plan] ?? PLAN_META.basico;
            return (
              <Link
                key={row.id}
                href={`/admin/agentes/${row.id}`}
                className="flex flex-col gap-1.5 px-3 py-2.5 rounded-lg transition-all hover:opacity-80"
                style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: row.active ? '#22c55e' : '#6b7280' }}
                      title={row.active ? 'Activo' : 'Pausado'}
                    />
                    <span className="text-sm truncate font-medium" style={{ color: 'var(--c-text)' }}>
                      {row.business_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: `${meta.color}18`,
                        color: meta.color,
                        border: `1px solid ${meta.color}40`,
                      }}
                    >
                      {meta.label}
                    </span>
                    {row.mxn > 0 && (
                      <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>
                        ${row.mxn.toLocaleString('es-MX')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <Stat label="Llamadas"    value={row.calls} />
                  <Stat label="Leads"       value={row.leads}       color="#22c55e" />
                  <Stat label="Prom."       value={`${row.avgMin}m`} />
                  <Stat label="Min. usados" value={row.minutesUsed} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border)' }}>
      {children}
    </div>
  );
}

function FilterBtn({ active, color, onClick, children }: {
  active: boolean; color?: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-all"
      style={{
        background: active ? (color ?? '#6C3BFF') : 'transparent',
        color: active ? '#fff' : (color ?? 'var(--c-text-3)'),
      }}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div>
      <div className="text-xs" style={{ color: color ?? 'var(--c-text)' }}>{value}</div>
      <div style={{ color: 'var(--c-text-3)', fontSize: '10px' }}>{label}</div>
    </div>
  );
}
