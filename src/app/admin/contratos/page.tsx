export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { FileText, CheckCircle, Clock, ExternalLink, Pencil } from 'lucide-react';
import Link from 'next/link';
import { PLAN_LABELS } from '@/types/agent';
import type { Plan } from '@/types/agent';

const PLAN_COLORS: Record<string, string> = {
  basico: '#6b7280', estandar: '#3b82f6', pro: '#a855f7',
};

export default async function ContratosPage() {
  const supabase = createAdminClient();
  const { data: agents } = await supabase
    .from('voice_agents')
    .select('id, business_name, client_name, plan, portal_token, contract_text, contract_accepted_at, active')
    .order('created_at', { ascending: false });

  const list = agents ?? [];
  const signedCount  = list.filter(a => a.contract_accepted_at).length;
  const pendingCount = list.filter(a => !a.contract_accepted_at).length;
  const customCount  = list.filter(a => a.contract_text).length;

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>Contratos</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--c-text-3)' }}>
          Gestión de contratos y propuestas por agente
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Firmados',      value: signedCount,  color: '#22c55e' },
          { label: 'Pendientes',    value: pendingCount, color: '#f59e0b' },
          { label: 'Personalizados', value: customCount,  color: '#6C3BFF' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Agent list */}
      <div className="flex flex-col gap-3">
        {list.map(agent => {
          const signed    = !!agent.contract_accepted_at;
          const hasCustom = !!agent.contract_text;
          const planColor = PLAN_COLORS[agent.plan] ?? '#6b7280';
          const signedDate = agent.contract_accepted_at
            ? new Date(agent.contract_accepted_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
            : null;

          return (
            <div key={agent.id} className="rounded-xl p-4 flex items-center gap-4"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>

              {/* Icon */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: signed ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)' }}>
                {signed
                  ? <CheckCircle size={16} color="#22c55e" />
                  : <Clock size={16} color="#f59e0b" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>{agent.business_name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${planColor}18`, color: planColor, border: `1px solid ${planColor}40` }}>
                    {PLAN_LABELS[agent.plan as Plan] ?? agent.plan}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: hasCustom ? 'rgba(108,59,255,0.08)' : 'var(--c-surface-2)', color: hasCustom ? '#9B6DFF' : 'var(--c-text-3)' }}>
                    {hasCustom ? 'Personalizado' : 'Automático'}
                  </span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>
                  {agent.client_name}
                  {signedDate && <span style={{ color: '#22c55e' }}> · Firmado {signedDate}</span>}
                  {!signed && <span style={{ color: '#f59e0b' }}> · Pendiente de firma</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {agent.portal_token && (
                  <a
                    href={`/portal/${agent.portal_token}/contrato`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                    style={{ background: 'var(--c-surface-2)', color: 'var(--c-text-2)', border: '1px solid var(--c-border)' }}
                  >
                    <ExternalLink size={12} />
                    Ver
                  </a>
                )}
                <Link
                  href={`/admin/agentes/${agent.id}/editar?tab=contrato`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(108,59,255,0.08)', color: '#9B6DFF', border: '1px solid rgba(108,59,255,0.2)' }}
                >
                  <Pencil size={12} />
                  Editar
                </Link>
              </div>
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--c-text-3)' }}>
            <FileText size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Sin agentes configurados</p>
          </div>
        )}
      </div>
    </div>
  );
}
