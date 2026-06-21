import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/portal/auth';

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id }            = await params;
  const { email, password } = await req.json() as { email?: string; password?: string };

  if (!email || !password) return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });

  const hash = await hashPassword(password);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('voice_agents')
    .update({ portal_email: email.toLowerCase().trim(), portal_password_hash: hash })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
