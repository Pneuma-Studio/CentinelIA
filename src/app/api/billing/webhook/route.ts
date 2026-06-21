import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { FEATURE_PLAN_CONFIG, MINUTES_PLAN_CONFIG, minutesPlanFromPriceId, nextResetDate } from '@/lib/billing/plans';
import { sendWhatsApp } from '@/lib/whatsapp/send';
import { sendEmail, paymentFailedHtml } from '@/lib/email/send';
import { pauseVapiAgent, resumeVapiAgent } from '@/lib/vapi/control';
import type { Plan } from '@/types/agent';
import type { MinutesPlan } from '@/lib/billing/plans';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // Extra minutes top-up
      if (session.metadata?.type === 'extra_minutes') {
        const agentId = session.metadata?.agent_id;
        const minutes = parseInt(session.metadata?.minutes ?? '0');
        if (!agentId || !minutes) break;

        const { data: agent } = await supabase
          .from('voice_agents')
          .select('minutes_included')
          .eq('id', agentId)
          .single();

        await supabase.from('voice_agents')
          .update({ minutes_included: (agent?.minutes_included ?? 0) + minutes })
          .eq('id', agentId);

        await supabase.from('minutes_ledger').insert({
          agent_id:    agentId,
          amount:      minutes,
          description: `Compra de ${minutes} minutos extra`,
          source:      'extra_compra',
        });
        break;
      }

      const agentId     = session.metadata?.agent_id;
      const featurePlan = session.metadata?.feature_plan as Plan | undefined;
      const minutesPlan = session.metadata?.minutes_plan as MinutesPlan | undefined;

      if (!agentId || !featurePlan || !minutesPlan
        || !FEATURE_PLAN_CONFIG[featurePlan]
        || !MINUTES_PLAN_CONFIG[minutesPlan]) break;

      const minutesCfg = MINUTES_PLAN_CONFIG[minutesPlan];

      await supabase.from('voice_agents').update({
        plan:                   featurePlan,
        minutes_plan:           minutesPlan,
        active:                 true,
        billing_status:         'activo',
        stripe_customer_id:     session.customer as string,
        stripe_subscription_id: session.subscription as string,
        minutes_included:       minutesCfg.minutes,
        minutes_used:           0,
        minutes_reset_date:     nextResetDate(),
        grace_period_ends_at:   null,
      }).eq('id', agentId);

      await supabase.from('minutes_ledger').insert({
        agent_id:    agentId,
        amount:      minutesCfg.minutes,
        description: `Activación plan — ${minutesCfg.minutes} minutos incluidos`,
        source:      'activacion',
      });

      // Re-associate Vapi assistant when reactivating
      const { data: agent } = await supabase
        .from('voice_agents')
        .select('phone_number, vapi_agent_id')
        .eq('id', agentId)
        .single();
      if (agent?.phone_number && agent?.vapi_agent_id) {
        await resumeVapiAgent(agent.phone_number, agent.vapi_agent_id);
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason !== 'subscription_cycle') break;

      const subId = typeof invoice.parent?.subscription_details?.subscription === 'string'
        ? invoice.parent.subscription_details.subscription
        : (invoice.parent?.subscription_details?.subscription as Stripe.Subscription | undefined)?.id;
      if (!subId) break;

      const sub         = await stripe.subscriptions.retrieve(subId);
      const agentId     = sub.metadata?.agent_id;
      const minutesPlan = minutesPlanFromPriceId(sub.items.data[0]?.price.id ?? '');
      if (!agentId || !minutesPlan) break;

      const minutesCfg = MINUTES_PLAN_CONFIG[minutesPlan];

      // Rollover: carry unused minutes (capped at 1× the plan base)
      const { data: prevAgent } = await supabase
        .from('voice_agents')
        .select('minutes_used, minutes_included')
        .eq('id', agentId)
        .single();
      const unused   = prevAgent ? Math.max(0, prevAgent.minutes_included - prevAgent.minutes_used) : 0;
      const rollover = Math.min(unused, minutesCfg.minutes);

      await supabase.from('voice_agents').update({
        minutes_plan:         minutesPlan,
        minutes_included:     minutesCfg.minutes + rollover,
        minutes_used:         0,
        minutes_reset_date:   nextResetDate(),
        active:               true,
        billing_status:       'activo',
        grace_period_ends_at: null,
      }).eq('id', agentId);

      await supabase.from('minutes_ledger').insert({
        agent_id:    agentId,
        amount:      minutesCfg.minutes,
        description: `Renovación mensual — ${minutesCfg.minutes} minutos`,
        source:      'renovacion',
      });
      if (rollover > 0) {
        await supabase.from('minutes_ledger').insert({
          agent_id:    agentId,
          amount:      rollover,
          description: `Rollover — ${rollover} minutos del mes anterior`,
          source:      'rollover',
        });
      }

      // Re-associate Vapi on renewal (in case it was paused for overage)
      const { data: agent } = await supabase
        .from('voice_agents')
        .select('phone_number, vapi_agent_id')
        .eq('id', agentId)
        .single();
      if (agent?.phone_number && agent?.vapi_agent_id) {
        await resumeVapiAgent(agent.phone_number, agent.vapi_agent_id);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;

      const subId = typeof invoice.parent?.subscription_details?.subscription === 'string'
        ? invoice.parent.subscription_details.subscription
        : (invoice.parent?.subscription_details?.subscription as Stripe.Subscription | undefined)?.id;
      if (!subId) break;

      const sub     = await stripe.subscriptions.retrieve(subId);
      const agentId = sub.metadata?.agent_id;
      if (!agentId) break;

      const gracePeriodEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('voice_agents').update({
        billing_status:        'pago_fallido',
        grace_period_ends_at:  gracePeriodEndsAt,
      }).eq('id', agentId);

      const { data: agent } = await supabase
        .from('voice_agents')
        .select('business_name, client_email, transfer_whatsapp')
        .eq('id', agentId)
        .single();

      if (agent?.transfer_whatsapp) {
        await sendWhatsApp(
          agent.transfer_whatsapp,
          `⚠️ *Pago fallido — ${agent.business_name}*\n\nNo pudimos procesar el pago de tu suscripción CentinelIA. Tienes *3 días* para regularizar el pago antes de que el agente sea pausado automáticamente.\n\nActualiza tu método de pago para continuar el servicio sin interrupciones.`
        );
      }
      if (agent?.client_email) {
        await sendEmail({
          to: agent.client_email,
          subject: `💳 Pago fallido — ${agent.business_name}`,
          html: paymentFailedHtml(agent.business_name),
        }).catch(console.error);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub     = event.data.object as Stripe.Subscription;
      const agentId = sub.metadata?.agent_id;
      if (!agentId) break;

      await supabase.from('voice_agents').update({
        active:                 false,
        billing_status:         'cancelado',
        stripe_subscription_id: null,
      }).eq('id', agentId);

      const { data: agent } = await supabase
        .from('voice_agents')
        .select('business_name, transfer_whatsapp, phone_number')
        .eq('id', agentId)
        .single();

      // Pause Vapi on cancellation
      if (agent?.phone_number) await pauseVapiAgent(agent.phone_number);

      if (agent?.transfer_whatsapp) {
        await sendWhatsApp(
          agent.transfer_whatsapp,
          `📴 *Suscripción cancelada — ${agent.business_name}*\n\nTu agente de voz ha sido desactivado. Contáctanos para reactivar el servicio.`
        );
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
