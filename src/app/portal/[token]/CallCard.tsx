'use client';

import { useState } from 'react';
import { ChevronDown, Play } from 'lucide-react';

const OUTCOME_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  lead_created:       { label: 'Lead',        color: '#6C3BFF', bg: 'rgba(108,59,255,0.1)'  },
  appointment_booked: { label: 'Cita',         color: '#3b82f6', bg: 'rgba(59,130,246,0.1)'  },
  order_taken:        { label: 'Pedido',       color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  transferred:        { label: 'Transferido',  color: '#a855f7', bg: 'rgba(168,85,247,0.1)'  },
  info_provided:      { label: 'Información',  color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  escalated_whatsapp: { label: 'WhatsApp',     color: '#16a34a', bg: 'rgba(22,163,74,0.1)'   },
  other:              { label: 'Otro',         color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
};

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

export default function CallCard({ call }: { call: Call }) {
  const [open, setOpen] = useState(false);
  const outcome = OUTCOME_LABELS[call.outcome] ?? OUTCOME_LABELS.other;
  const hasDetails = !!(call.transcript || call.recording_url);

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border)' }}>
      {/* Row */}
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
              {Math.ceil(call.duration_seconds / 60)} min
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

      {/* Expanded details */}
      {open && hasDetails && (
        <div className="px-4 pb-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--c-border)' }}>
          {call.recording_url && (
            <div className="pt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Play size={11} style={{ color: 'var(--c-text-3)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--c-text-3)' }}>Grabación</span>
              </div>
              <audio controls src={call.recording_url} className="w-full h-10"
                style={{ accentColor: '#6C3BFF' }} />
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
  );
}
