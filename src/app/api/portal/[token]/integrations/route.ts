import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySession, PORTAL_COOKIE } from '@/lib/portal/auth';

interface Params { params: Promise<{ token: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { token }    = await params;
  const cookieStore  = await cookies();
  const session      = await verifySession(cookieStore.get(PORTAL_COOKIE)?.value ?? '');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('voice_agents')
    .select('calendar_type, calendar_event_type_id, calendar_link, calendar_api_key')
    .eq('portal_token', token)
    .single();

  return NextResponse.json({
    calendar_type:            data?.calendar_type           ?? null,
    calendar_event_type_id:   data?.calendar_event_type_id  ?? '',
    calendar_link:            data?.calendar_link            ?? '',
    cal_api_configured:       !!(data?.calendar_api_key),
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { token }    = await params;
  const cookieStore  = await cookies();
  const session      = await verifySession(cookieStore.get(PORTAL_COOKIE)?.value ?? '');
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const allowed = ['calendar_type', 'calendar_api_key', 'calendar_event_type_id', 'calendar_link'];
  const update: Record<string, string | null> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key] || null;
  }

  const supabase = createAdminClient();
  await supabase.from('voice_agents').update(update).eq('portal_token', token);

  return NextResponse.json({ ok: true });
}
