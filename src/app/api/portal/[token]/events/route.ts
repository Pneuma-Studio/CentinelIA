import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySession, PORTAL_COOKIE } from '@/lib/portal/auth';

interface Params { params: Promise<{ token: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const cookie = req.cookies.get(PORTAL_COOKIE)?.value ?? '';
  const auth   = await verifySession(cookie);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { token } = await params;
  const since = req.nextUrl.searchParams.get('since');
  if (!since) return NextResponse.json({ calls: [] });

  const supabase = createAdminClient();
  const { data: agent } = await supabase
    .from('voice_agents').select('id').eq('portal_token', token).single();
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: calls } = await supabase
    .from('voice_calls')
    .select('id, outcome, caller_number, created_at')
    .eq('agent_id', agent.id)
    .gt('created_at', since)
    .order('created_at', { ascending: false })
    .limit(10);

  return NextResponse.json({ calls: calls ?? [] });
}
