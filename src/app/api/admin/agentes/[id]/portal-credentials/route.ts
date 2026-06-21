import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/portal/auth';

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id }            = await params;
  const { email, password } = await req.json() as { email?: string; password?: string };

  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
  if (password !== undefined && password.length < 8) return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });

  const supabase = createAdminClient();
  const update: Record<string, string> = { portal_email: email.toLowerCase().trim() };
  if (password) update.portal_password_hash = await hashPassword(password);

  const { error } = await supabase
    .from('voice_agents')
    .update(update)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
