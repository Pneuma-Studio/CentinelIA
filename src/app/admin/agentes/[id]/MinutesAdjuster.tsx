'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

export default function MinutesAdjuster({
  agentId,
  minutesUsed,
  minutesIncluded,
}: {
  agentId: string;
  minutesUsed: number;
  minutesIncluded: number;
}) {
  const [used, setUsed]       = useState(minutesUsed);
  const [included, setIncluded] = useState(minutesIncluded);
  const [delta, setDelta]     = useState('');
  const [target, setTarget]   = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]     = useState(false);

  const apply = async (action: 'add' | 'set', amount: number) => {
    if (isNaN(amount)) return;
    setLoading(true);
    setSaved(false);
    const res = await fetch(`/api/admin/agentes/${agentId}/minutes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, amount }),
    });
    if (res.ok) {
      const data = await res.json();
      setUsed(data.minutes_used);
      setIncluded(data.minutes_included);
      setSaved(true);
      setDelta('');
      setTarget('');
      setTimeout(() => setSaved(false), 2000);
    }
    setLoading(false);
  };

  const pct = included > 0 ? Math.min((used / included) * 100, 100) : 0;
  const barColor = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e';

  return (
    <div className="p-5 rounded-xl flex flex-col gap-4" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
      <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>Minutos</div>

      {/* Bar */}
      <div>
        <div className="flex items-end gap-2 mb-1">
          <span className="text-2xl font-bold" style={{ color: barColor }}>{used}</span>
          <span className="text-sm mb-0.5" style={{ color: 'var(--c-text-3)' }}>/ {included}</span>
          {saved && <Check size={14} color="#22c55e" className="mb-1" />}
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: 'var(--c-border)' }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
        </div>
      </div>

      {/* Add/subtract */}
      <div>
        <div className="text-xs mb-1.5" style={{ color: 'var(--c-text-3)' }}>Sumar / restar minutos</div>
        <div className="flex gap-2">
          <input
            type="number"
            value={delta}
            onChange={e => setDelta(e.target.value)}
            placeholder="+50 ó -20"
            className="flex-1 rounded-lg px-3 py-1.5 text-sm outline-none"
            style={{ background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', color: 'var(--c-text)' }}
          />
          <button
            onClick={() => apply('add', parseInt(delta))}
            disabled={loading || !delta}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: '#6C3BFF', color: '#fff' }}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : 'Aplicar'}
          </button>
        </div>
      </div>

      {/* Set exact value */}
      <div>
        <div className="text-xs mb-1.5" style={{ color: 'var(--c-text-3)' }}>Establecer en valor exacto</div>
        <div className="flex gap-2">
          <input
            type="number"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="0"
            min={0}
            className="flex-1 rounded-lg px-3 py-1.5 text-sm outline-none"
            style={{ background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', color: 'var(--c-text)' }}
          />
          <button
            onClick={() => apply('set', parseInt(target))}
            disabled={loading || !target}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: 'var(--c-surface-2)', color: 'var(--c-text)', border: '1px solid var(--c-border)' }}
          >
            Fijar
          </button>
        </div>
      </div>
    </div>
  );
}
