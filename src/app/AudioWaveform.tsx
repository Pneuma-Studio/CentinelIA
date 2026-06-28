'use client';

export default function AudioWaveform({ barCount = 25 }: { barCount?: number }) {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div className="audio-waveform" aria-hidden>
      {bars.map(i => (
        <span
          key={i}
          className="wavebar"
          style={{ animationDelay: `${Math.round(i * 900 / barCount)}ms` }}
        />
      ))}
    </div>
  );
}
