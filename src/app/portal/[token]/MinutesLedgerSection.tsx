import { createAdminClient } from '@/lib/supabase/admin';
import { RefreshCw, Zap, CreditCard, Plus, Phone } from 'lucide-react';

interface LedgerEntry {
  date: string;
  amount: number;
  description: string;
  source: string;
}

const SOURCE_ICON: Record<string, React.ReactNode> = {
  renovacion:   <RefreshCw size={12} />,
  rollover:     <RefreshCw size={12} />,
  extra_compra: <Zap size={12} />,
  activacion:   <CreditCard size={12} />,
  ajuste:       <Plus size={12} />,
  llamadas:     <Phone size={12} />,
};

const SOURCE_COLOR: Record<string, string> = {
  renovacion:   '#6C3BFF',
  rollover:     '#a855f7',
  extra_compra: '#f59e0b',
  activacion:   '#3b82f6',
  ajuste:       '#22c55e',
  llamadas:     'var(--c-text-3)',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function MinutesLedgerSection({ agentId }: { agentId: string }) {
  const supabase = createAdminClient();

  const [ledgerRes, callsRes] = await Promise.all([
    supabase
      .from('minutes_ledger')
      .select('created_at, amount, description, source')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(60),
    supabase
      .from('voice_calls')
      .select('created_at, duration_seconds')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  const credits: LedgerEntry[] = (ledgerRes.data ?? []).map(r => ({
    date:        r.created_at,
    amount:      r.amount,
    description: r.description,
    source:      r.source,
  }));

  // Aggregate calls by calendar day → one debit entry per day
  const callsByDay: Record<string, number> = {};
  for (const call of callsRes.data ?? []) {
    const day = call.created_at.slice(0, 10);
    callsByDay[day] = (callsByDay[day] ?? 0) + Math.ceil((call.duration_seconds ?? 0) / 60);
  }

  const debits: LedgerEntry[] = Object.entries(callsByDay)
    .filter(([, mins]) => mins > 0)
    .map(([day, mins]) => ({
      date:        day + 'T12:00:00Z',
      amount:      -mins,
      description: `${mins} min consumidos en llamadas`,
      source:      'llamadas',
    }));

  const entries = [...credits, ...debits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 60);

  if (entries.length === 0) {
    return (
      <div className="text-xs text-center py-4" style={{ color: 'var(--c-text-3)' }}>
        Sin movimientos registrados
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: '1px' }}>
      {entries.map((e, i) => {
        const isCredit = e.amount > 0;
        const color    = SOURCE_COLOR[e.source] ?? 'var(--c-text-3)';
        const icon     = SOURCE_ICON[e.source] ?? <Plus size={12} />;
        return (
          <div
            key={i}
            className="flex items-start gap-3 py-2.5 px-1"
            style={{ borderBottom: '1px solid var(--c-divider)' }}
          >
            <div className="flex-shrink-0 mt-0.5 p-1 rounded" style={{ background: `${color}18`, color }}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-snug" style={{ color: 'var(--c-text-2)' }}>{e.description}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-4)' }}>{fmt(e.date)}</p>
            </div>
            <span
              className="text-sm font-bold flex-shrink-0 tabular-nums"
              style={{ color: isCredit ? '#22c55e' : 'var(--c-text-3)' }}
            >
              {isCredit ? '+' : ''}{e.amount} min
            </span>
          </div>
        );
      })}
    </div>
  );
}
