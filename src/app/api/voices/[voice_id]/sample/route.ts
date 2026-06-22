import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SAMPLE_TEXT = 'Hola, gracias por llamar. ¿En qué le puedo ayudar el día de hoy?';

// Simple in-process cache so we don't regenerate on every play click
const cache = new Map<string, ArrayBuffer>();

const audioHeaders = { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400' };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ voice_id: string }> }) {
  const { voice_id } = await params;
  const apiKey = (process.env.ELEVENLABS_API_KEY ?? '').trim();
  if (!apiKey) return NextResponse.json({ error: 'missing_key' }, { status: 500 });

  if (cache.has(voice_id)) {
    return new Response(cache.get(voice_id), { headers: audioHeaders });
  }

  const reqHeaders = new Headers({ 'xi-api-key': apiKey, 'Content-Type': 'application/json' });
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
    method: 'POST',
    headers: reqHeaders,
    body: JSON.stringify({
      text: SAMPLE_TEXT,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, use_speaker_boost: true },
    }),
  });

  if (!res.ok) {
    console.error('ElevenLabs TTS error:', res.status, await res.text().catch(() => ''));
    return NextResponse.json({ error: 'tts_failed' }, { status: 502 });
  }

  const buf = await res.arrayBuffer();
  cache.set(voice_id, buf);
  return new Response(buf, { headers: audioHeaders });
}
