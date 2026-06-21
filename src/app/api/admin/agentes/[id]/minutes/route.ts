import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { action, amount, reason } = await req.json();

  if (!['add', 'set'].includes(action) || typeof amount !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (action === 'set') {
    const { data: prev } = await supabase
      .from('voice_agents')
      .select('minutes_used')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('voice_agents')
      .update({ minutes_used: Math.max(0, amount) })
      .eq('id', id)
      .select('minutes_used, minutes_included')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log delta as ledger entry (set: delta = -(new - old) from client balance perspective)
    if (prev) {
      const delta = -((Math.max(0, amount)) - (prev.minutes_used ?? 0));
      if (delta !== 0) {
        await supabase.from('minutes_ledger').insert({
          agent_id:    id,
          amount:      delta,
          description: reason?.trim() || `Ajuste manual — contador de uso actualizado a ${amount} min`,
          source:      'ajuste',
        });
      }
    }

    return NextResponse.json(data);
  }

  // action === 'add'
  const { data: agent } = await supabase
    .from('voice_agents')
    .select('minutes_used')
    .eq('id', id)
    .single();

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  const newValue = Math.max(0, (agent.minutes_used ?? 0) + amount);
  const { data, error } = await supabase
    .from('voice_agents')
    .update({ minutes_used: newValue })
    .eq('id', id)
    .select('minutes_used, minutes_included')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log to ledger: adding to minutes_used reduces available balance → negative ledger entry
  if (amount !== 0) {
    await supabase.from('minutes_ledger').insert({
      agent_id:    id,
      amount:      -amount,
      description: reason?.trim() || (amount < 0
        ? `Corrección — ${Math.abs(amount)} min devueltos`
        : `Ajuste manual — ${amount} min descontados`),
      source: 'ajuste',
    });
  }

  return NextResponse.json(data);
}
