import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySession, PORTAL_COOKIE } from '@/lib/portal/auth';
import { FEATURE_PLAN_CONFIG, MINUTES_PLAN_CONFIG } from '@/lib/billing/plans';
import { PLAN_FEATURES } from '@/types/agent';
import type { Plan, MinutesPlan } from '@/types/agent';

const PLAN_DEFAULT_MINUTES: Record<Plan, MinutesPlan> = {
  basico:   'starter',
  estandar: 'growth',
  pro:      'scale',
};

interface Params { params: Promise<{ token: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;

  const cookieStore = await cookies();
  const auth = await verifySession(cookieStore.get(PORTAL_COOKIE)?.value ?? '');
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { to_plan } = await req.json() as { to_plan: Plan };

  if (!['basico', 'estandar', 'pro'].includes(to_plan)) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: agent } = await supabase
    .from('voice_agents')
    .select('id, business_name, plan, stripe_customer_id, stripe_subscription_id')
    .eq('portal_token', token)
    .single();

  if (!agent) return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 });
  if (agent.plan === to_plan) return NextResponse.json({ error: 'Ya estás en este plan' }, { status: 400 });
  if (!agent.stripe_subscription_id) return NextResponse.json({ error: 'Sin suscripción activa' }, { status: 400 });

  const from_plan      = agent.plan as Plan;
  const to_minutes_plan = PLAN_DEFAULT_MINUTES[to_plan];
  const from_cfg       = FEATURE_PLAN_CONFIG[from_plan];
  const to_cfg         = FEATURE_PLAN_CONFIG[to_plan];
  const setup_diff     = to_cfg.setupFee - from_cfg.setupFee;

  if (setup_diff > 0) {
    // Upgrade: cobrar diferencia de instalación via Checkout
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const session = await stripe.checkout.sessions.create({
      customer: agent.stripe_customer_id ?? undefined,
      mode:     'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency:    'mxn',
          unit_amount: setup_diff * 100,
          product_data: {
            name:        `Upgrade a ${to_cfg.label} — Centinelia`,
            description: `Diferencia de instalación: ${from_cfg.label} → ${to_cfg.label}`,
          },
        },
      }],
      metadata: {
        type:            'plan_upgrade',
        agent_id:        agent.id,
        to_plan,
        to_minutes_plan,
      },
      success_url: `${appUrl}/portal/${token}?tab=minutos&upgrade=ok`,
      cancel_url:  `${appUrl}/portal/${token}?tab=minutos`,
      locale:      'es',
    });
    return NextResponse.json({ url: session.url });
  }

  // Downgrade: sin pago, cambio inmediato sin proration
  const sub     = await stripe.subscriptions.retrieve(agent.stripe_subscription_id);
  const subItem = sub.items.data.find(item => item.price.recurring !== null);
  if (!subItem) return NextResponse.json({ error: 'Suscripción sin plan recurrente' }, { status: 400 });

  await stripe.subscriptions.update(agent.stripe_subscription_id, {
    items:              [{ id: subItem.id, price: MINUTES_PLAN_CONFIG[to_minutes_plan].priceId() }],
    proration_behavior: 'none',
  });

  await supabase.from('voice_agents').update({
    plan:         to_plan,
    features:     PLAN_FEATURES[to_plan],
    minutes_plan: to_minutes_plan,
  }).eq('id', agent.id);

  return NextResponse.json({ success: true });
}
