'use client';

import { useState } from 'react';
import { Clock, Check, Loader2 } from 'lucide-react';
import type { BusinessHours, DaySchedule } from '@/types/agent';

const DAYS: { key: keyof BusinessHours; label: string }[] = [
  { key: 'monday',    label: 'Lunes' },
  { key: 'tuesday',   label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday',  label: 'Jueves' },
  { key: 'friday',    label: 'Viernes' },
  { key: 'saturday',  label: 'Sábado' },
  { key: 'sunday',    label: 'Domingo' },
];

const DEFAULT_HOURS: BusinessHours = {
  monday:    { open: true,  from: '09:00', to: '18:00' },
  tuesday:   { open: true,  from: '09:00', to: '18:00' },
  wednesday: { open: true,  from: '09:00', to: '18:00' },
  thursday:  { open: true,  from: '09:00', to: '18:00' },
  friday:    { open: true,  from: '09:00', to: '18:00' },
  saturday:  { open: false },
  sunday:    { open: false },
};

export default function BusinessHoursEditor({
  token,
  initialHours,
}: {
  token: string;
  initialHours: BusinessHours | null;
}) {
  const [enabled, setEnabled]   = useState<boolean>(!!initialHours);
  const [hours, setHours]       = useState<BusinessHours>(initialHours ?? DEFAULT_HOURS);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const toggle = (key: keyof BusinessHours) => {
    const s = hours[key];
    setHours(h => ({ ...h, [key]: { ...s, open: !s.open } }));
  };

  const setTime = (key: keyof BusinessHours, field: 'from' | 'to', value: string) => {
    setHours(h => ({ ...h, [key]: { ...h[key], [field]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/portal/${token}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_hours: enabled ? hours : null }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Enable toggle */}
      <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
        style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border)' }}>
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Restringir horario</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--c-text-2)' }}>
            {enabled ? 'El agente solo contesta en el horario configurado' : 'El agente contesta 24/7'}
          </div>
        </div>
        <button type="button" onClick={() => setEnabled(v => !v)}
          className="w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ml-4"
          style={{ background: enabled ? '#6C3BFF' : 'var(--c-border-2)' }}>
          <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
            style={{ left: enabled ? '1.25rem' : '0.125rem' }} />
        </button>
      </label>

      {/* Day rows */}
      {enabled && (
        <div className="flex flex-col gap-1.5">
          {DAYS.map(({ key, label }) => {
            const s: DaySchedule = hours[key] ?? { open: false };
            return (
              <div key={key} className="grid items-center gap-3 px-3 py-2 rounded-lg"
                style={{
                  gridTemplateColumns: '90px 1fr',
                  background: 'var(--c-surface-2)',
                  border: '1px solid var(--c-border)',
                }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <button type="button" onClick={() => toggle(key)}
                    className="w-8 h-4 rounded-full transition-colors relative flex-shrink-0"
                    style={{ background: s.open ? '#6C3BFF' : 'var(--c-border-2)' }}>
                    <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                      style={{ left: s.open ? '1rem' : '0.125rem' }} />
                  </button>
                  <span className="text-xs" style={{ color: s.open ? 'var(--c-text)' : 'var(--c-text-3)' }}>
                    {label}
                  </span>
                </label>

                {s.open ? (
                  <div className="flex items-center gap-2">
                    <input type="time" value={s.from ?? '09:00'}
                      onChange={e => setTime(key, 'from', e.target.value)}
                      className="rounded px-2 py-1 text-xs outline-none"
                      style={{ background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', color: 'var(--c-text)', colorScheme: 'light dark' }} />
                    <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>–</span>
                    <input type="time" value={s.to ?? '18:00'}
                      onChange={e => setTime(key, 'to', e.target.value)}
                      className="rounded px-2 py-1 text-xs outline-none"
                      style={{ background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', color: 'var(--c-text)', colorScheme: 'light dark' }} />
                  </div>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--c-text-4)' }}>Cerrado</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
        style={{ background: saved ? '#22c55e' : '#6C3BFF', color: '#fff' }}
      >
        {saving
          ? <><Loader2 size={14} className="animate-spin" /> Guardando…</>
          : saved
            ? <><Check size={14} /> Guardado</>
            : <><Clock size={14} /> Guardar horario</>}
      </button>
    </div>
  );
}
