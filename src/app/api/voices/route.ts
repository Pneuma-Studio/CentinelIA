import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = (process.env.ELEVENLABS_API_KEY ?? '').trim();
  if (!apiKey) return NextResponse.json({ voices: [], error: 'missing_key' });

  try {
    const headers = new Headers();
    headers.set('xi-api-key', apiKey);
    const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('ElevenLabs voices error:', res.status, text);
      return NextResponse.json({ voices: [], error: res.status });
    }

    const data = await res.json();

    // Optional explicit allowlist: VOICE_ALLOWLIST="id1,id2,id3" in env vars
    const allowlist = (process.env.VOICE_ALLOWLIST ?? '')
      .split(',').map(s => s.trim()).filter(Boolean);

    const voices = (data.voices ?? [])
      .filter((v: Record<string, unknown>) => {
        if (v.category === 'premade') return false;
        if (allowlist.length > 0) return allowlist.includes(v.voice_id as string);
        return true;
      })
      .map((v: Record<string, unknown>) => ({
        voice_id:    v.voice_id,
        name:        v.name,
        preview_url: v.preview_url ?? null,
        labels:      (v.labels as Record<string, string>) ?? {},
      }));

    return NextResponse.json({ voices });
  } catch (err) {
    console.error('ElevenLabs fetch exception:', err);
    return NextResponse.json({ voices: [], error: 'fetch_failed' }, { status: 500 });
  }
}
