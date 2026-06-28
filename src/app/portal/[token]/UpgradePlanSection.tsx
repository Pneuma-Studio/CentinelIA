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
    features:   ['Recepcionista 24/7', 'Captura de leads', 'Resúmenes por WhatsApp y Email', 'Portal con historial y horas pico'],
    color:      '#6b7280',
  },
  {
    key:        'estandar',
    label:      'Comercial',
    setupFee:   7990,
    monthlyFee: 3490,
    minutes:    500,
    features:   ['Todo lo de Recepcionista', 'Agendamiento de citas', 'Transferencia inteligente', 'Escalación a WhatsApp', 'Reporte semanal por email'],
    color:      '#3b82f6',
  },
  {
    key:        'pro',
    label:      'Pro',
    setupFee:   12990,
    monthlyFee: 6490,
    minutes:    1000,
    features:   ['Todo lo de Comercial', 'Toma de pedidos', 'Memoria de cliente', 'Voz personalizable', 'Multiidioma (ES + EN)', 'Grabaciones de llamadas'],
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
      {/* Shared feature — all plans */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1"
        style={{ background: 'rgba(66,133,244,0.08)', border: '1px solid rgba(66,133,244,0.2)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span className="text-xs" style={{ color: 'var(--c-text-2)' }}>
          <span style={{ fontWeight: 600, color: 'var(--c-text)' }}>Incluido en todos los planes:</span>{' '}
          Reseña Google automática por WhatsApp tras cada llamada exitosa.
        </span>
      </div>

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
