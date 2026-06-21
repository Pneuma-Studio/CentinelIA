import type { Plan } from '@/types/agent';

export type MinutesPlan = 'starter' | 'growth' | 'scale' | 'enterprise';

export interface FeaturePlanConfig {
  label: string;
  setupFee: number;
  setupPriceId: () => string;
}

export interface MinutesPlanConfig {
  label: string;
  minutes: number;
  mxn: number;
  priceId: () => string;
}

export const FEATURE_PLAN_CONFIG: Record<Plan, FeaturePlanConfig> = {
  basico:   { label: 'Básico',   setupFee: 4990,  setupPriceId: () => process.env.STRIPE_SETUP_BASICO! },
  estandar: { label: 'Estándar', setupFee: 8990,  setupPriceId: () => process.env.STRIPE_SETUP_ESTANDAR! },
  pro:      { label: 'Pro',      setupFee: 14990, setupPriceId: () => process.env.STRIPE_SETUP_PRO! },
};

export const MINUTES_PLAN_CONFIG: Record<MinutesPlan, MinutesPlanConfig> = {
  starter:    { label: 'Starter',    minutes: 200,  mxn: 1990,  priceId: () => process.env.STRIPE_MINUTES_STARTER! },
  growth:     { label: 'Growth',     minutes: 500,  mxn: 3990,  priceId: () => process.env.STRIPE_MINUTES_GROWTH! },
  scale:      { label: 'Scale',      minutes: 1500, mxn: 7990,  priceId: () => process.env.STRIPE_MINUTES_SCALE! },
  enterprise: { label: 'Enterprise', minutes: 3000, mxn: 12990, priceId: () => process.env.STRIPE_MINUTES_ENTERPRISE! },
};

export function minutesPlanFromPriceId(priceId: string): MinutesPlan | null {
  for (const [plan, cfg] of Object.entries(MINUTES_PLAN_CONFIG) as [MinutesPlan, MinutesPlanConfig][]) {
    if (cfg.priceId() === priceId) return plan;
  }
  return null;
}

export function nextResetDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 1);
  return d.toISOString().slice(0, 10);
}
