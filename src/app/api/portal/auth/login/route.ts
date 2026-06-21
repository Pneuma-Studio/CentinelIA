import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyPassword, createSession, PORTAL_COOKIE } from '@/lib/portal/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email?: string; password?: string };
  if (!email || !password) return NextResponse.json({ error: 'Credenciales requeridas' }, { status: 400 });

  const supabase = createAdminClient();
  const { data: agent } = await supabase
    .from('voice_agents')
    .select('id, portal_token, portal_password_hash, active')
    .eq('portal_email', email.toLowerCase().trim())
    .single();

  if (!agent?.portal_password_hash) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }

  const ok = await verifyPassword(password, agent.portal_password_hash);
  if (!ok) return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });

  const session = await createSession(agent.id, agent.portal_token);
  const res = NextResponse.json({ token: agent.portal_token });
  res.cookies.set(PORTAL_COOKIE, session, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 24 * 7,
  });
  return res;
}
