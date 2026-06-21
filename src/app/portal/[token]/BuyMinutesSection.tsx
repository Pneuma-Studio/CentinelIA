'use client';

import { useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';

const PACKS = [
  { minutes: 100, price: 1000,  label: '100 min',  desc: 'Para un mes con poca actividad extra' },
  { minutes: 250, price: 2500,  label: '250 min',  desc: 'El más popular para temporadas altas' },
  { minutes: 500, price: 5000,  label: '500 min',  desc: 'Para negocios con mucho volumen' },
];

export default function BuyMinutesSection({ token }: { token: string }) {
  const [loading, setLoading] = useState<number | null>(null);

  const buy = async (minutes: number) => {
    setLoading(minutes);
    try {
      const res = await fetch(`/api/portal/${token}/buy-minutes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {PACKS.map(pack => (
        <button
          key={pack.minutes}
          onClick={() => buy(pack.minutes)}
          disabled={loading !== null}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all hover:shadow-sm"
          style={{
            background: loading === pack.minutes ? 'var(--c-input-bg)' : 'var(--c-surface)',
            border: '1px solid var(--c-input-border)',
            opacity: loading !== null && loading !== pack.minutes ? 0.5 : 1,
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{pack.label}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--c-input-bg)', color: '#6C3BFF' }}>
                ${pack.price.toLocaleString('es-MX')} MXN
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>{pack.desc}</p>
          </div>
          <div className="flex-shrink-0 ml-3">
            {loading === pack.minutes
              ? <Loader2 size={16} className="animate-spin" style={{ color: '#6C3BFF' }} />
              : <Zap size={16} style={{ color: '#6C3BFF' }} />}
          </div>
        </button>
      ))}
      <p className="text-xs text-center mt-1" style={{ color: 'var(--c-text-3)' }}>
        $10 MXN / min · Pago único · Se suman al saldo actual
      </p>
    </div>
  );
}
