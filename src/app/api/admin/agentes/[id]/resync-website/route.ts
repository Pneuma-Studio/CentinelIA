import { NextRequest, NextResponse } from 'next/server';
import { resyncWebsite } from '../route';

interface Params { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const result = await resyncWebsite(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, chars: result.chars });
}
