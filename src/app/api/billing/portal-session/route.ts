import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'token requerido' }, { status: 400 });

  const supabase = createAdminClient();
  const { data: agent } = await supabase
    .from('voice_agents')
    .select('stripe_customer_id')
    .eq('portal_token', token)
    .single();

  if (!agent?.stripe_customer_id) {
    return NextResponse.json({ error: 'Sin suscripción activa' }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await stripe.billingPortal.sessions.create({
    customer:   agent.stripe_customer_id,
    return_url: `${appUrl}/portal/${token}`,
  });

  return NextResponse.redirect(session.url);
}
