import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface Params { params: Promise<{ id: string }> }

// credit  → adds to minutes_included (client gains minutes)
// debit   → adds to minutes_used    (client loses minutes)
// set_used → sets minutes_used to exact value (correction)

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { action, amount, reason } = await req.json() as {
    action: 'credit' | 'debit' | 'set_used';
    amount: number;
    reason?: string;
  };

  if (!['credit', 'debit', 'set_used'].includes(action) || typeof amount !== 'number' || amount < 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: agent } = await supabase
    .from('voice_agents')
    .select('minutes_used, minutes_included')
    .eq('id', id)
    .single();

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  let update: Record<string, number> = {};
  let ledgerAmount = 0;
  let ledgerDescription = reason?.trim() || '';

  if (action === 'credit') {
    update = { minutes_included: agent.minutes_included + amount };
    ledgerAmount = amount;
    if (!ledgerDescription) ledgerDescription = `Crédito manual, ${amount} min acreditados`;
  } else if (action === 'debit') {
    update = { minutes_used: agent.minutes_used + amount };
    ledgerAmount = -amount;
    if (!ledgerDescription) ledgerDescription = `Descuento manual, ${amount} min descontados`;
  } else {
    // set_used
    const delta = amount - agent.minutes_used;
    update = { minutes_used: Math.max(0, amount) };
    ledgerAmount = -delta;
    if (!ledgerDescription) ledgerDescription = `Corrección, uso ajustado a ${amount} min`;
  }

  const { data, error } = await supabase
    .from('voice_agents')
    .update(update)
    .eq('id', id)
    .select('minutes_used, minutes_included')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (ledgerAmount !== 0) {
    await supabase.from('minutes_ledger').insert({
      agent_id:    id,
      amount:      ledgerAmount,
      description: ledgerDescription,
      source:      'ajuste',
    });
  }

  return NextResponse.json(data);
}
