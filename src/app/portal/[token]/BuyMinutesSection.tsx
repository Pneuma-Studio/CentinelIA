'use client';

import { useState } from 'react';
import { Zap } from 'lucide-react';

const PACKAGES = [
  { minutes: 50,  label: '50 min',  sub: '$599 MXN' },
  { minutes: 100, label: '100 min', sub: '$999 MXN' },
  { minutes: 250, label: '250 min', sub: '$1,990 MXN' },
];

export default function BuyMinutesSection({ token }: { token: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleBuy = async () => {
    if (selected === null || loading) return;
    setLoading(true);
    const res = await fetch('/api/portal/buy-minutes', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token, minutes: selected }),
    });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-1.5">
        {PACKAGES.map(pkg => {
          const active = selected === pkg.minutes;
          return (
            <button
              key={pkg.minutes}
              onClick={() => setSelected(pkg.minutes)}
              className="flex flex-col items-center py-2.5 px-1 rounded-lg text-center transition-all"
              style={{
                background: active ? 'rgba(108,59,255,0.12)' : 'var(--c-surface-2)',
                border:     `1px solid ${active ? 'rgba(108,59,255,0.4)' : 'var(--c-border)'}`,
                color:      active ? '#6C3BFF' : 'var(--c-text-2)',
              }}
            >
              <span className="text-sm font-bold">{pkg.label}</span>
              <span className="text-xs mt-0.5" style={{ opacity: 0.7 }}>{pkg.sub}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleBuy}
        disabled={selected === null || loading}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
        style={{
          background: selected !== null ? '#6C3BFF' : 'var(--c-surface-2)',
          color:      selected !== null ? '#fff' : 'var(--c-text-3)',
          cursor:     selected !== null ? 'pointer' : 'not-allowed',
          opacity:    loading ? 0.6 : 1,
        }}
      >
        <Zap size={14} />
        {loading ? 'Redirigiendo…' : 'Comprar minutos'}
      </button>
    </div>
  );
}
