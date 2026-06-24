'use client';

export default function AudioWaveform({ barCount = 28 }: { barCount?: number }) {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div className="audio-waveform" aria-hidden>
      {bars.map(i => (
        <span
          key={i}
          className="wavebar"
          style={{ animationDelay: `${(i * 37) % 700}ms` }}
        />
      ))}
    </div>
  );
}
