import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';
import { PLAN_FEATURES } from '@/types/agent';
import { sendWhatsApp } from '@/lib/whatsapp/send';
import type { Plan } from '@/types/agent';

const PLAN_MINUTES_COUNT: Record<Plan, number> = {
  basico:   200,
  estandar: 500,
  pro:      1500,
};

const PLAN_MINUTES_PLAN: Record<Plan, string> = {
  basico:   'starter',
  estandar: 'growth',
  pro:      'scale',
};

function setupPriceId(plan: Plan): string {
  const map: Record<Plan, string> = {
    basico:   process.env.STRIPE_SETUP_BASICO!,
    estandar: process.env.STRIPE_SETUP_ESTANDAR!,
    pro:      process.env.STRIPE_SETUP_PRO!,
  };
  return map[plan];
}

function minutesPriceId(plan: Plan): string {
  const map: Record<Plan, string> = {
    basico:   process.env.STRIPE_MINUTES_STARTER!,
    estandar: process.env.STRIPE_MINUTES_GROWTH!,
    pro:      process.env.STRIPE_MINUTES_SCALE!,
  };
  return map[plan];
}

export async function POST(req: NextRequest) {
  const {
    plan,
    business_name,
    business_description,
    business_phone_display,
    giro_template,
    agent_name,
    client_name,
    client_email,
    transfer_whatsapp,
    area_code,
  } = await req.json();

  // Common field validation
  if (!business_name?.trim())
    return NextResponse.json({ error: 'Nombre del negocio requerido' }, { status: 400 });
  if (!business_description?.trim())
    return NextResponse.json({ error: 'Descripción del negocio requerida' }, { status: 400 });
  if (!client_name?.trim())
    return NextResponse.json({ error: 'Tu nombre es requerido' }, { status: 400 });
  if (!client_email?.trim())
    return NextResponse.json({ error: 'Correo electrónico requerido' }, { status: 400 });
  if (!transfer_whatsapp?.trim())
    return NextResponse.json({ error: 'WhatsApp requerido' }, { status: 400 });

  const supabase = createAdminClient();
  const email    = client_email.trim().toLowerCase();

  const resetDate = new Date();
  resetDate.setMonth(resetDate.getMonth() + 1, 1);

  // ── Empresarial: save lead + notify admin, no Stripe ────────────────────────
  if (plan === 'empresarial') {
    await supabase.from('voice_agents').insert({
      client_name:            client_name.trim(),
      client_email:           email,
      portal_email:           email,
      business_name:          business_name.trim(),
      business_description:   business_description.trim(),
      business_phone_display: business_phone_display?.trim() ?? '',
      giro_template:          giro_template ?? 'general',
      agent_name:             agent_name?.trim() || null,
      transfer_whatsapp:      transfer_whatsapp.trim(),
      timezone:               'America/Monterrey',
      phone_number:           '',
      plan:                   'pro',
      features:               PLAN_FEATURES['pro'],
      minutes_included:       0,
      minutes_used:           0,
      minutes_reset_date:     resetDate.toISOString().slice(0, 10),
      active:                 false,
      billing_status:         'pendiente',
    });

    const adminWa = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? process.env.SUPPORT_WHATSAPP ?? '';
    if (adminWa) {
      await sendWhatsApp(
        adminWa,
        `🏢 *Nueva solicitud Empresarial — Centinelia*\n\nNegocio: *${business_name.trim()}*\nGiro: ${giro_template ?? 'general'}\nCiudad lada: ${area_code ?? '—'}\n\nContacto: ${client_name.trim()}\nEmail: ${email}\nWA: ${transfer_whatsapp.trim()}\n\nRequiere cotización e integración con sistema existente.`
      ).catch(console.error);
    }

    return NextResponse.json({ empresarial: true });
  }

  // ── Standard plans (basico / estandar / pro) ────────────────────────────────
  if (!['basico', 'estandar', 'pro'].includes(plan))
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });
  if (!business_phone_display?.trim())
    return NextResponse.json({ error: 'Teléfono requerido' }, { status: 400 });

  const p = plan as Plan;

  const { data: agent, error } = await supabase
    .from('voice_agents')
    .insert({
      client_name:            client_name.trim(),
      client_email:           email,
      portal_email:           email,
      business_name:          business_name.trim(),
      business_description:   business_description.trim(),
      business_phone_display: business_phone_display.trim(),
      giro_template:          giro_template ?? 'general',
      agent_name:             p === 'pro' ? (agent_name?.trim() || null) : null,
      transfer_whatsapp:      transfer_whatsapp.trim(),
      timezone:               'America/Monterrey',
      phone_number:           '',
      plan:                   p,
      features:               PLAN_FEATURES[p],
      minutes_included:       PLAN_MINUTES_COUNT[p],
      minutes_reset_date:     resetDate.toISOString().slice(0, 10),
      active:                 false,
      billing_status:         'pendiente',
    })
    .select()
    .single();

  if (error || !agent) {
    console.error('onboarding/start:', error);
    return NextResponse.json({ error: 'Error al registrar el agente' }, { status: 500 });
  }

  const customer = await stripe.customers.create({
    name:     `${client_name.trim()} — ${business_name.trim()}`,
    email,
    metadata: { agent_id: agent.id },
  });

  await supabase.from('voice_agents').update({ stripe_customer_id: customer.id }).eq('id', agent.id);

  const appUrl  = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await stripe.checkout.sessions.create({
    customer:  customer.id,
    mode:      'subscription',
    line_items: [
      { price: setupPriceId(p),   quantity: 1 },
      { price: minutesPriceId(p), quantity: 1 },
    ],
    metadata: {
      agent_id:     agent.id,
      feature_plan: p,
      minutes_plan: PLAN_MINUTES_PLAN[p],
      source:       'onboarding',
      area_code:    area_code ?? '',
    },
    subscription_data: {
      metadata: {
        agent_id:     agent.id,
        feature_plan: p,
        minutes_plan: PLAN_MINUTES_PLAN[p],
      },
    },
    success_url: `${appUrl}/registro/pendiente?token=${agent.portal_token}`,
    cancel_url:  `${appUrl}/registro?canceled=1`,
    locale:      'es',
  });

  return NextResponse.json({ url: session.url });
}
