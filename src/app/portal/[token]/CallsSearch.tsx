'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import CallCard from './CallCard';
import type { VoiceCall } from '@/types/agent';

export default function CallsSearch({ calls, isPro }: { calls: VoiceCall[]; isPro: boolean }) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() =>
    q
      ? calls.filter(c =>
          c.caller_number?.toLowerCase().includes(q) ||
          c.summary?.toLowerCase().includes(q) ||
          c.transcript?.toLowerCase().includes(q)
        )
      : calls,
    [calls, q]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--c-text-3)' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por número o resumen…"
          className="w-full pl-8 pr-8 py-2 rounded-lg text-xs"
          style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border)', color: 'var(--c-text)', outline: 'none' }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--c-text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 340, padding: '1px 2px 4px' }}>
        {filtered.length === 0
          ? (
            <p className="text-xs text-center py-6" style={{ color: 'var(--c-text-4)' }}>
              {q ? 'Sin resultados para esta búsqueda' : 'Sin llamadas en este período'}
            </p>
          )
          : filtered.map(call => <CallCard key={call.id} call={call} isPro={isPro} />)
        }
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-center" style={{ color: 'var(--c-text-4)' }}>
          {q
            ? `${filtered.length} de ${calls.length} llamadas`
            : `${calls.length} llamada${calls.length !== 1 ? 's' : ''}`
          }
        </p>
      )}
    </div>
  );
}
