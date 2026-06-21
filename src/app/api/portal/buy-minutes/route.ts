import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const PACKAGES = [
  { minutes: 50,  priceMxn: 599  },
  { minutes: 100, priceMxn: 999  },
  { minutes: 250, priceMxn: 1990 },
] as const;

export async function POST(req: NextRequest) {
  const { token, minutes } = await req.json() as { token: string; minutes: number };

  const pkg = PACKAGES.find(p => p.minutes === minutes);
  if (!pkg) return NextResponse.json({ error: 'Paquete inválido' }, { status: 400 });

  const supabase = createAdminClient();
  const { data: agent } = await supabase
    .from('voice_agents')
    .select('id, client_name, business_name, stripe_customer_id')
    .eq('portal_token', token)
    .single();

  if (!agent) return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 });

  let customerId: string = agent.stripe_customer_id ?? '';
  if (!customerId) {
    const customer = await stripe.customers.create({
      name:     `${agent.client_name} — ${agent.business_name}`,
      metadata: { agent_id: agent.id },
    });
    customerId = customer.id;
    await supabase.from('voice_agents').update({ stripe_customer_id: customerId }).eq('id', agent.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode:     'payment',
    line_items: [{
      quantity: 1,
      price_data: {
        currency:     'mxn',
        unit_amount:  pkg.priceMxn * 100,
        product_data: {
          name:        `${pkg.minutes} minutos extra — CentinelIA`,
          description: `Se suman inmediatamente al saldo de ${agent.business_name}`,
        },
      },
    }],
    metadata: {
      type:     'extra_minutes',
      agent_id: agent.id,
      minutes:  String(pkg.minutes),
    },
    success_url: `${appUrl}/portal/${token}?minutos=ok`,
    cancel_url:  `${appUrl}/portal/${token}`,
  });

  return NextResponse.json({ url: session.url });
}
