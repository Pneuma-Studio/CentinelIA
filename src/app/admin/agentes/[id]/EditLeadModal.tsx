'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface Lead {
  id: string;
  nombre?: string;
  negocio?: string;
  giro?: string;
  servicio?: string;
  presupuesto?: string;
  timeline?: string;
  email?: string;
  whatsapp?: string;
  created_at: string;
}

interface Props {
  lead: Lead;
  onClose: () => void;
  onSaved: (updated: Lead) => void;
}

export default function EditLeadModal({ lead, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre:      lead.nombre      ?? '',
    negocio:     lead.negocio     ?? '',
    giro:        lead.giro        ?? '',
    servicio:    lead.servicio    ?? '',
    presupuesto: lead.presupuesto ?? '',
    timeline:    lead.timeline    ?? '',
    email:       lead.email       ?? '',
    whatsapp:    lead.whatsapp    ?? '',
  });

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await res.json();
      onSaved(updated);
    } else {
      alert('Error al guardar');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: 'var(--c-modal)', border: '1px solid var(--c-border-2)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--c-text)' }}>Editar lead</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--c-surface-2)] transition-colors"
            style={{ color: 'var(--c-text-2)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <Field label="Nombre" value={form.nombre} onChange={v => setForm(f => ({ ...f, nombre: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Negocio" value={form.negocio} onChange={v => setForm(f => ({ ...f, negocio: v }))} />
            <Field label="Giro" value={form.giro} onChange={v => setForm(f => ({ ...f, giro: v }))} />
          </div>
          <Field label="Servicio" value={form.servicio} onChange={v => setForm(f => ({ ...f, servicio: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Presupuesto" value={form.presupuesto} onChange={v => setForm(f => ({ ...f, presupuesto: v }))} />
            <Field label="Para cuándo" value={form.timeline} onChange={v => setForm(f => ({ ...f, timeline: v }))} />
          </div>
          <Field label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          <Field label="WhatsApp" value={form.whatsapp} onChange={v => setForm(f => ({ ...f, whatsapp: v }))} />
        </div>

        <div className="flex gap-3 mt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'var(--c-input-bg)', color: 'var(--c-text-2)' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
            style={{ background: '#6C3BFF', color: '#FAFBFF', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: 'var(--c-text-2)' }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={{ background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', color: 'var(--c-text)' }}
      />
    </div>
  );
}
