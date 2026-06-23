import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: agent } = await supabase
    .from('voice_agents')
    .select('id')
    .eq('portal_token', token)
    .single();

  if (!agent) return NextResponse.json({ call: null });

  const { searchParams } = new URL(req.url);
  const itemDate = searchParams.get('date');
  if (!itemDate) return NextResponse.json({ call: null });

  const date = new Date(itemDate);
  const from = new Date(date.getTime() - 120000).toISOString();
  const to   = new Date(date.getTime() + 120000).toISOString();

  const { data: call } = await supabase
    .from('voice_calls')
    .select('id, recording_url, created_at, duration_seconds, caller_number, outcome')
    .eq('agent_id', agent.id)
    .gte('created_at', from)
    .lte('created_at', to)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ call: call ?? null });
}
