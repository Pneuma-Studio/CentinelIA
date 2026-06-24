'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Loader2, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_HOURS = {
  monday:    { open: true,  from: '09:00', to: '18:00' },
  tuesday:   { open: true,  from: '09:00', to: '18:00' },
  wednesday: { open: true,  from: '09:00', to: '18:00' },
  thursday:  { open: true,  from: '09:00', to: '18:00' },
  friday:    { open: true,  from: '09:00', to: '18:00' },
  saturday:  { open: false },
  sunday:    { open: false },
};

export default function NuevoWhatsAppAgentePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    client_name:          '',
    business_name:        '',
    business_description: '',
    wa_phone_number:      '',
    agent_name:           '',
    timezone:             'America/Monterrey',
    knowledge_base:       '',
    transfer_whatsapp:    '',
    client_email:         '',
    capture_leads:        true,
    capture_appointments: false,
    capture_orders:       false,
  });

  const set = (key: string, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch('/api/admin/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push('/admin/whatsapp');
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Error al crear el agente');
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/whatsapp" className="p-1.5 rounded-lg hover:bg-[var(--c-surface-2)]"
          style={{ color: 'var(--c-text-3)' }}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>Nuevo agente de WhatsApp</h1>
          <p className="text-sm" style={{ color: 'var(--c-text-3)' }}>Configura un asistente IA para responder en WhatsApp</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Cliente */}
        <section className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Información del cliente</h2>
          <Field label="Nombre del cliente" required>
            <input value={form.client_name} onChange={e => set('client_name', e.target.value)}
              required placeholder="Ej: Juan García" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Correo del cliente">
            <input type="email" value={form.client_email} onChange={e => set('client_email', e.target.value)}
              placeholder="juan@empresa.com" className={inputCls} style={inputStyle} />
          </Field>
        </section>

        {/* Negocio */}
        <section className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Negocio</h2>
          <Field label="Nombre del negocio" required>
            <input value={form.business_name} onChange={e => set('business_name', e.target.value)}
              required placeholder="Ej: Restaurante El Pino" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Descripción del negocio">
            <textarea value={form.business_description} onChange={e => set('business_description', e.target.value)}
              rows={3} placeholder="Describe brevemente qué hace el negocio, sus servicios principales..."
              className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Base de conocimiento (precios, servicios, FAQs)">
            <textarea value={form.knowledge_base} onChange={e => set('knowledge_base', e.target.value)}
              rows={6} placeholder="Agrega aquí productos, precios, preguntas frecuentes, políticas..."
              className={inputCls} style={inputStyle} />
          </Field>
        </section>

        {/* WhatsApp config */}
        <section className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
            <MessageCircle size={15} style={{ color: '#25D366' }} />
            Configuración de WhatsApp
          </h2>
          <Field label="Número de WhatsApp del agente (Twilio)" required
            hint="El número de Twilio asignado a este agente, ej: +14155238886">
            <input value={form.wa_phone_number} onChange={e => set('wa_phone_number', e.target.value)}
              required placeholder="+14155238886" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Nombre del agente"
            hint="Cómo se presenta el agente. Por defecto usa el nombre del negocio.">
            <input value={form.agent_name} onChange={e => set('agent_name', e.target.value)}
              placeholder="Ej: Lupita" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="WhatsApp del dueño (para notificaciones de leads)">
            <input value={form.transfer_whatsapp} onChange={e => set('transfer_whatsapp', e.target.value)}
              placeholder="+521234567890" className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Zona horaria">
            <select value={form.timezone} onChange={e => set('timezone', e.target.value)}
              className={inputCls} style={inputStyle}>
              <option value="America/Monterrey">America/Monterrey (CST)</option>
              <option value="America/Mexico_City">America/Mexico_City (CST)</option>
              <option value="America/Tijuana">America/Tijuana (PST)</option>
              <option value="America/Cancun">America/Cancun (EST)</option>
            </select>
          </Field>
        </section>

        {/* Funciones */}
        <section className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Funciones del agente</h2>
          <p className="text-xs" style={{ color: 'var(--c-text-3)' }}>
            El agente siempre responderá preguntas usando la base de conocimiento. Activa funciones adicionales:
          </p>
          <Toggle checked={form.capture_leads} onChange={v => set('capture_leads', v)}
            label="Captura de leads" desc="Recopila nombre, contacto e interés del prospecto" />
          <Toggle checked={form.capture_appointments} onChange={v => set('capture_appointments', v)}
            label="Agendamiento de citas" desc="Recopila fecha, hora y datos del cliente para citas" />
          <Toggle checked={form.capture_orders} onChange={v => set('capture_orders', v)}
            label="Toma de pedidos" desc="Recibe pedidos con detalles completos" />
        </section>

        {error && (
          <p className="text-sm text-red-400 px-1">{error}</p>
        )}

        <div className="flex gap-3">
          <Link href="/admin/whatsapp"
            className="flex-1 py-3 rounded-xl text-sm font-medium text-center"
            style={{ background: 'var(--c-input-bg)', color: 'var(--c-text-2)' }}>
            Cancelar
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
            style={{ background: '#25D366', color: '#fff' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {saving ? 'Creando agente…' : 'Crear agente'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, hint, required }: {
  label: string; children: React.ReactNode; hint?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)' }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--c-text-3)' }}>{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label, desc }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; desc: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex items-center gap-3 p-3 rounded-xl text-left w-full transition-colors"
      style={{ background: checked ? 'rgba(37,211,102,0.08)' : 'var(--c-input-bg)', border: `1px solid ${checked ? 'rgba(37,211,102,0.25)' : 'var(--c-input-border)'}` }}>
      <div className="w-8 h-4.5 rounded-full relative flex-shrink-0 transition-colors"
        style={{ background: checked ? '#25D366' : 'var(--c-border)', height: '18px' }}>
        <div className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform shadow-sm"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }} />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{label}</p>
        <p className="text-xs" style={{ color: 'var(--c-text-3)' }}>{desc}</p>
      </div>
    </button>
  );
}

const inputCls = 'w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none';
const inputStyle = {
  background: 'var(--c-input-bg)',
  border: '1px solid var(--c-input-border)',
  color: 'var(--c-text)',
} as React.CSSProperties;
