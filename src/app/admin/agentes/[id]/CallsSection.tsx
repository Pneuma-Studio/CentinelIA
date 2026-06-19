'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Mic, FileText, ExternalLink } from 'lucide-react';
import type { VoiceCall } from '@/types/agent';

const OUTCOME_LABELS: Record<string, { label: string; color: string }> = {
  lead_created:       { label: 'Lead',       color: '#22c55e' },
  appointment_booked: { label: 'Cita',        color: '#3b82f6' },
  order_taken:        { label: 'Pedido',      color: '#f59e0b' },
  transferred:        { label: 'Transferido', color: '#a855f7' },
  info_provided:      { label: 'Información', color: '#6b7280' },
  escalated_whatsapp: { label: 'WhatsApp',    color: '#25D366' },
  other:              { label: 'Otro',        color: '#4b5563' },
};

function OutcomeBadge({ outcome }: { outcome: string }) {
  const o = OUTCOME_LABELS[outcome] ?? OUTCOME_LABELS.other;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${o.color}22`, color: o.color }}>
      {o.label}
    </span>
  );
}

function CallRow({ call, timezone }: { call: VoiceCall; timezone: string }) {
  const [open, setOpen] = useState(false);
  const hasDetails = call.summary || call.transcript || call.recording_url;

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div
        className="flex items-center justify-between px-3 py-2.5 cursor-pointer select-none"
        onClick={() => hasDetails && setOpen(o => !o)}
      >
        <div>
          <div className="text-sm text-white">{call.caller_number || 'Desconocido'}</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {new Date(call.created_at).toLocaleString('es-MX', { timeZone: timezone ?? 'America/Monterrey' })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {call.recording_url && <Mic size={13} style={{ color: '#a855f7' }} />}
          {call.transcript && <FileText size={13} style={{ color: '#3b82f6' }} />}
          <OutcomeBadge outcome={call.outcome} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {Math.ceil(call.duration_seconds / 60)} min
          </span>
          {hasDetails && (
            open
              ? <ChevronUp size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
              : <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
          )}
        </div>
      </div>

      {open && hasDetails && (
        <div className="px-3 pb-3 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {call.summary && (
            <div className="pt-3">
              <div className="text-xs font-semibold mb-1.5 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Resumen</div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{call.summary}</p>
            </div>
          )}

          {call.recording_url && (
            <div>
              <div className="text-xs font-semibold mb-1.5 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Grabación</div>
              <div className="flex items-center gap-2">
                <audio
                  controls
                  src={call.recording_url}
                  className="w-full h-8"
                  style={{ accentColor: '#a855f7' }}
                />
                <a
                  href={call.recording_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-1.5 rounded hover:bg-white/10 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          )}

          {call.transcript && (
            <div>
              <div className="text-xs font-semibold mb-1.5 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Transcripción</div>
              <div
                className="text-xs leading-relaxed rounded-lg p-3 max-h-48 overflow-y-auto whitespace-pre-wrap"
                style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}
              >
                {call.transcript}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CallsSection({ calls, timezone }: { calls: VoiceCall[]; timezone: string }) {
  return (
    <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Llamadas recientes ({calls.length})
      </h2>
      {calls.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Sin llamadas registradas</p>
      ) : (
        <div className="flex flex-col gap-2">
          {calls.map(call => (
            <CallRow key={call.id} call={call} timezone={timezone} />
          ))}
        </div>
      )}
    </div>
  );
}
