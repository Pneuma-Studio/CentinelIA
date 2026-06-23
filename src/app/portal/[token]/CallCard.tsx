'use client';

import { useState } from 'react';
import { ChevronDown, Play, Download, Clock } from 'lucide-react';

const OUTCOME_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  lead_created:       { label: 'Lead',        color: '#6C3BFF', bg: 'rgba(108,59,255,0.1)'  },
  appointment_booked: { label: 'Cita',         color: '#3b82f6', bg: 'rgba(59,130,246,0.1)'  },
  order_taken:        { label: 'Pedido',       color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  transferred:        { label: 'Transferido',  color: '#a855f7', bg: 'rgba(168,85,247,0.1)'  },
  info_provided:      { label: 'Información',  color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  escalated_whatsapp: { label: 'WhatsApp',     color: '#16a34a', bg: 'rgba(22,163,74,0.1)'   },
  missed:             { label: 'Perdida',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  other:              { label: 'Otro',         color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
};

const RECORDING_TTL_DAYS = 7;

interface Call {
  id: string;
  caller_number: string;
  outcome: string;
  duration_seconds: number;
  created_at: string;
  summary?: string;
  transcript?: string;
  recording_url?: string;
}

function RecordingPlayer({ url, createdAt }: { url: string; createdAt: string }) {
  const [downloading, setDownloading] = useState(false);

  const callDate    = new Date(createdAt);
  const expiresAt   = new Date(callDate.getTime() + RECORDING_TTL_DAYS * 24 * 60 * 60 * 1000);
  const now         = new Date();
  const expired     = now > expiresAt;
  const daysLeft    = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const expiresLabel = expiresAt.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

  if (expired) {
    return (
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          6,
        padding:      '8px 12px',
        borderRadius: 8,
        background:   'var(--c-surface)',
        border:       '1px solid var(--c-border)',
        color:        'var(--c-text-3)',
        fontSize:     12,
      }}>
        <Clock size={13} />
        Grabación expirada
      </div>
    );
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      const a    = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = `llamada-${createdAt.slice(0, 10)}.wav`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Play size={11} style={{ color: 'var(--c-text-3)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-3)' }}>Grabación</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display:      'flex',
            alignItems:   'center',
            gap:          4,
            fontSize:     11,
            color:        daysLeft <= 2 ? '#f59e0b' : 'var(--c-text-3)',
          }}>
            <Clock size={10} />
            Disponible hasta {expiresLabel}
          </span>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          4,
              padding:      '4px 10px',
              borderRadius: 7,
              background:   'var(--c-surface)',
              border:       '1px solid var(--c-border)',
              color:        'var(--c-text-2)',
              fontSize:     11,
              fontWeight:   600,
              cursor:       downloading ? 'default' : 'pointer',
              opacity:      downloading ? 0.6 : 1,
              transition:   'opacity 0.15s',
            }}
          >
            <Download size={11} />
            {downloading ? 'Descargando…' : 'Descargar'}
          </button>
        </div>
      </div>
      <audio
        controls
        src={url}
        style={{ width: '100%', height: 36, accentColor: '#6C3BFF' }}
      />
    </div>
  );
}

export default function CallCard({ call, isPro }: { call: Call; isPro?: boolean }) {
  const [open, setOpen] = useState(false);
  const outcome    = OUTCOME_LABELS[call.outcome] ?? OUTCOME_LABELS.other;
  const showRec    = isPro && !!call.recording_url;
  const hasDetails = !!(call.transcript || showRec);

  return (
    <div className="rounded-xl overflow-hidden flex"
      style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border)' }}>
      {/* Left accent stripe */}
      <div style={{ width: 3, background: outcome.color, flexShrink: 0, opacity: 0.65 }} />

      {/* Content column */}
      <div className="flex-1 min-w-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
                {call.caller_number || 'Número desconocido'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{ background: outcome.bg, color: outcome.color }}>
                {outcome.label}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>
                {Math.max(1, Math.ceil(call.duration_seconds / 60))} min
              </span>
              <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>
                {new Date(call.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
              </span>
              {hasDetails && (
                <button onClick={() => setOpen(v => !v)}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                  style={{ background: 'var(--c-surface)', color: 'var(--c-text-3)', border: '1px solid var(--c-border)' }}>
                  <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  {open ? 'Cerrar' : 'Ver más'}
                </button>
              )}
            </div>
          </div>
          {call.summary && (
            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--c-text-2)' }}>{call.summary}</p>
          )}
        </div>

        {open && hasDetails && (
          <div className="px-4 pb-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--c-border)' }}>

            {showRec && (
              <div className="pt-3">
                <RecordingPlayer url={call.recording_url!} createdAt={call.created_at} />
              </div>
            )}

            {call.transcript && (
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: 'var(--c-text-3)' }}>Transcripción</div>
                <div className="max-h-48 overflow-y-auto rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap"
                  style={{ background: 'var(--c-surface)', color: 'var(--c-text-2)', border: '1px solid var(--c-border)' }}>
                  {call.transcript}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
