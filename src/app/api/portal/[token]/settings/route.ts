import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface Params { params: Promise<{ token: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const { data: agent } = await supabase
    .from('voice_agents').select('id').eq('portal_token', token).single();
  if (!agent) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const allowed = ['business_hours'];
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase
    .from('voice_agents').update(update).eq('id', agent.id).select('business_hours').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
