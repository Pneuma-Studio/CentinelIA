'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import CallsSection from '../agentes/[id]/CallsSection';
import type { VoiceCall } from '@/types/agent';

interface Agent { id: string; business_name: string; timezone: string }

interface Props {
  calls: VoiceCall[];
  agents: Agent[];
}

const OUTCOMES = [
  { value: '', label: 'Todos los resultados' },
  { value: 'lead_created', label: 'Lead' },
  { value: 'appointment_booked', label: 'Cita' },
  { value: 'order_taken', label: 'Pedido' },
  { value: 'transferred', label: 'Transferido' },
  { value: 'info_provided', label: 'Información' },
  { value: 'other', label: 'Otro' },
];

export default function LlamadasClient({ calls, agents }: Props) {
  const [search, setSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');

  const agentMap: Record<string, Agent> = {};
  for (const a of agents) agentMap[a.id] = a;

  const filtered = useMemo(() => {
    return calls.filter(c => {
      if (search && !(c.caller_number ?? '').includes(search)) return false;
      if (agentFilter && c.agent_id !== agentFilter) return false;
      if (outcomeFilter && c.outcome !== outcomeFilter) return false;
      return true;
    });
  }, [calls, search, agentFilter, outcomeFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, VoiceCall[]> = {};
    for (const c of filtered) {
      if (!groups[c.agent_id]) groups[c.agent_id] = [];
      groups[c.agent_id].push(c);
    }
    return Object.entries(groups);
  }, [filtered]);

  const hasFilters = search || agentFilter || outcomeFilter;

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            placeholder="Buscar por número..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
            }}
          />
        </div>

        <select
          value={agentFilter}
          onChange={e => setAgentFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: agentFilter ? '#e2e8f0' : 'rgba(255,255,255,0.4)',
          }}
        >
          <option value="">Todos los agentes</option>
          {agents.map(a => <option key={a.id} value={a.id}>{a.business_name}</option>)}
        </select>

        <select
          value={outcomeFilter}
          onChange={e => setOutcomeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: outcomeFilter ? '#e2e8f0' : 'rgba(255,255,255,0.4)',
          }}
        >
          {OUTCOMES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setAgentFilter(''); setOutcomeFilter(''); }}
            className="px-3 py-2 rounded-lg text-xs transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Limpiar
          </button>
        )}
      </div>

      <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {filtered.length} llamada{filtered.length !== 1 ? 's' : ''}
        {hasFilters ? ' encontrada' + (filtered.length !== 1 ? 's' : '') : ''}
      </p>

      {grouped.length === 0 ? (
        <div className="p-12 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Filter size={28} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Sin resultados para los filtros aplicados</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([agentId, agentCalls]) => {
            const agent = agentMap[agentId];
            return (
              <div key={agentId}>
                <div className="text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {agent?.business_name ?? agentId}
                  <span className="ml-2 font-normal normal-case" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    ({agentCalls.length})
                  </span>
                </div>
                <CallsSection calls={agentCalls} timezone={agent?.timezone ?? 'America/Monterrey'} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
