import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
  }

  const trimmed = email.trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  if (!valid) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('waitlist')
    .insert({ email: trimmed })
    .select()
    .single();

  if (error) {
    // Duplicate email — treat as success so we don't leak info
    if (error.code === '23505') return NextResponse.json({ ok: true });
    console.error('Waitlist insert error:', error);
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
