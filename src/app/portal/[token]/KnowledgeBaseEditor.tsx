'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

export default function KnowledgeBaseEditor({
  token,
  initialValue,
}: {
  token: string;
  initialValue: string;
}) {
  const [value, setValue]   = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/portal/${token}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ knowledge_base: value }),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs" style={{ color: 'var(--c-text-3)' }}>
        Actualiza el catálogo de servicios, precios y preguntas frecuentes que tu agente usa para responder.
      </p>
      <textarea
        value={value}
        onChange={e => { setValue(e.target.value); setSaved(false); }}
        rows={10}
        placeholder={'SERVICIOS:\n- Corte de cabello: $150\n- Tinte: $300\n\nFAQS:\n¿Aceptan tarjeta? Sí.'}
        className="w-full rounded-xl px-3 py-3 text-xs leading-relaxed outline-none resize-y"
        style={{
          background: 'var(--c-input-bg)',
          border: '1px solid var(--c-input-border)',
          color: 'var(--c-text)',
          minHeight: 180,
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--c-text-4)' }}>
          {value.length.toLocaleString('es-MX')} caracteres
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
          style={{ background: saved ? '#22c55e' : '#6C3BFF', color: '#fff' }}
        >
          {saving
            ? <><Loader2 size={13} className="animate-spin" />Guardando…</>
            : saved
              ? <><Check size={13} />Guardado</>
              : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
