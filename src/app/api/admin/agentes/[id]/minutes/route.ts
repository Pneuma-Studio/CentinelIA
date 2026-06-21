import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { action, amount } = await req.json();

  if (!['add', 'set'].includes(action) || typeof amount !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (action === 'set') {
    const { data, error } = await supabase
      .from('voice_agents')
      .update({ minutes_used: Math.max(0, amount) })
      .eq('id', id)
      .select('minutes_used, minutes_included')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // action === 'add' — use rpc for atomic increment (can be negative)
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
  return NextResponse.json(data);
}
