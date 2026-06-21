import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashPassword, createSession, PORTAL_COOKIE } from '@/lib/portal/auth';

export async function POST(req: NextRequest) {
  const { token, email, password } = await req.json() as {
    token?: string; email?: string; password?: string;
  };

  if (!token || !email || !password)
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });

  const supabase = createAdminClient();
  const { data: agent } = await supabase
    .from('voice_agents')
    .select('id, portal_token, portal_password_hash')
    .eq('portal_token', token)
    .single();

  if (!agent)
    return NextResponse.json({ error: 'Link inválido' }, { status: 404 });
  if (agent.portal_password_hash)
    return NextResponse.json({ error: 'already_registered' }, { status: 409 });

  const hash = await hashPassword(password);
  const { error } = await supabase
    .from('voice_agents')
    .update({ portal_email: email.toLowerCase().trim(), portal_password_hash: hash })
    .eq('id', agent.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const sessionValue = await createSession(email.toLowerCase().trim());
  const res = NextResponse.json({ ok: true, token });
  res.cookies.set(PORTAL_COOKIE, sessionValue, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
