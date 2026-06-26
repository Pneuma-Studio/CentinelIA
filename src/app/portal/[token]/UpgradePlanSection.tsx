'use client';

import { useState } from 'react';
import { Check, ArrowUpCircle, ArrowDownCircle, ChevronDown } from 'lucide-react';
import type { Plan } from '@/types/agent';

const PLANS: {
  key:        Plan;
  label:      string;
  setupFee:   number;
  monthlyFee: number;
  minutes:    number;
  features:   string[];
  color:      string;
}[] = [
  {
    key:        'basico',
    label:      'Recepcionista',
    setupFee:   4990,
    monthlyFee: 1990,
    minutes:    200,
    features:   ['Recepcionista 24/7', 'Agendamiento de citas'],
    color:      '#6b7280',
  },
  {
    key:        'estandar',
    label:      'Comercial',
    setupFee:   7990,
    monthlyFee: 3490,
    minutes:    500,
    features:   ['Todo Básico', 'Toma de pedidos', 'Calificación de leads', 'Escalación WhatsApp'],
    color:      '#3b82f6',
  },
  {
    key:        'pro',
    label:      'Pro',
    setupFee:   12990,
    monthlyFee: 6490,
    minutes:    1000,
    features:   ['Todo Estándar', 'Multiidioma', 'Memoria de cliente', 'Transferencia inteligente'],
    color:      '#a855f7',
  },
];

const PLAN_ORDER: Plan[] = ['basico', 'estandar', 'pro'];

export default function UpgradePlanSection({
  token,
  currentPlan,
}: {
  token:       string;
  currentPlan: Plan;
}) {
  const [expanded, setExpanded]             = useState<Plan | null>(currentPlan);
  const [loading, setLoading]               = useState<Plan | null>(null);
  const [downgradeConfirm, setDowngradeConfirm] = useState<Plan | null>(null);
  const [done, setDone]                     = useState(false);

  const currentIdx = PLAN_ORDER.indexOf(currentPlan);

  const handleChange = async (toPlan: Plan) => {
    const isDowngrade = PLAN_ORDER.indexOf(toPlan) < currentIdx;

    if (isDowngrade && downgradeConfirm !== toPlan) {
      setDowngradeConfirm(toPlan);
      return;
    }

    setLoading(toPlan);
    setDowngradeConfirm(null);
    try {
      const res  = await fetch(`/api/portal/${token}/change-plan`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ to_plan: toPlan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        setDone(true);
        setTimeout(() => window.location.reload(), 800);
      } else {
        setLoading(null);
      }
    } catch {
      setLoading(null);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 rounded-xl"
        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
        <Check size={14} color="#22c55e" />
        <span className="text-sm" style={{ color: '#22c55e' }}>Plan actualizado correctamente.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {PLANS.map((plan) => {
        const isCurrent   = plan.key === currentPlan;
        const isExpanded  = expanded === plan.key;
        const isUpgrade   = PLAN_ORDER.indexOf(plan.key) > currentIdx;
        const isDowngrade = PLAN_ORDER.indexOf(plan.key) < currentIdx;
        const currentCfg  = PLANS[currentIdx];
        const setupDiff   = plan.setupFee - currentCfg.setupFee;

        return (
          <div
            key={plan.key}
            className="rounded-xl overflow-hidden"
            style={{
              border:     `1px solid ${isExpanded ? plan.color + '55' : 'var(--c-border)'}`,
              background: isExpanded ? `${plan.color}0d` : 'var(--c-surface-2)',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            {/* Collapsed header — always visible, tap to toggle */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              onClick={() => setExpanded(isExpanded ? null : plan.key)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: plan.color }} />
              <span className="text-sm font-semibold flex-1" style={{ color: plan.color }}>{plan.label}</span>
              {isCurrent && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium mr-1"
                  style={{ background: `${plan.color}18`, color: plan.color }}>
                  Actual
                </span>
              )}
              <span className="text-xs tabular-nums" style={{ color: 'var(--c-text-3)' }}>
                ${plan.monthlyFee.toLocaleString('es-MX')}/mes
              </span>
              <ChevronDown
                size={14}
                style={{
                  color: 'var(--c-text-3)',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                  marginLeft: 4,
                }}
              />
            </button>

            {/* Expanded body */}
            {isExpanded && (
              <div className="px-4 pb-4" style={{ borderTop: `1px solid ${plan.color}22` }}>
                <p className="text-xs mt-3 mb-2" style={{ color: 'var(--c-text-3)' }}>
                  {plan.minutes} min incluidos · Instalación ${plan.setupFee.toLocaleString('es-MX')}
                </p>
                <div className="flex flex-col gap-1 mb-3">
                  {plan.features.map(f => (
                    <span key={f} className="text-xs flex items-center gap-1.5" style={{ color: 'var(--c-text-3)' }}>
                      <Check size={10} color={plan.color} />{f}
                    </span>
                  ))}
                </div>

                {!isCurrent && (
                  <>
                    {isUpgrade && setupDiff > 0 && (
                      <p className="text-xs mb-2" style={{ color: 'var(--c-text-3)' }}>
                        +${setupDiff.toLocaleString('es-MX')} de instalación adicional
                      </p>
                    )}

                    {downgradeConfirm === plan.key ? (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs" style={{ color: '#f59e0b' }}>
                          Sin reembolso por días restantes. ¿Confirmar?
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDowngradeConfirm(null)}
                            className="flex-1 py-1.5 rounded-lg text-xs"
                            style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text-3)' }}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleChange(plan.key)}
                            disabled={!!loading}
                            className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' }}
                          >
                            {loading === plan.key ? 'Procesando…' : 'Confirmar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleChange(plan.key)}
                        disabled={!!loading}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                        style={{
                          background: isUpgrade ? `${plan.color}18` : 'var(--c-surface)',
                          border:     `1px solid ${isUpgrade ? plan.color + '40' : 'var(--c-border)'}`,
                          color:      isUpgrade ? plan.color : 'var(--c-text-2)',
                          opacity:    loading ? 0.6 : 1,
                          cursor:     loading ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {loading === plan.key
                          ? 'Procesando…'
                          : isUpgrade
                            ? <><ArrowUpCircle size={12} /> Subir a {plan.label}</>
                            : <><ArrowDownCircle size={12} /> Bajar a {plan.label}</>
                        }
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      <p className="text-xs mt-1" style={{ color: 'var(--c-text-4)' }}>
        Upgrades cobran la diferencia de instalación al instante. Downgrades aplican inmediatamente sin reembolso.
      </p>
    </div>
  );
}
