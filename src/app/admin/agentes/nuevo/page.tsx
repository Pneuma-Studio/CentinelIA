'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PLAN_FEATURES, PLAN_LABELS, PLAN_MINUTES, FEATURE_LABELS } from '@/types/agent';
import type { Plan, AgentFeatures } from '@/types/agent';

const PLANS: Plan[] = ['basico', 'estandar', 'pro'];

const PLAN_COLORS: Record<Plan, string> = {
  basico:   '#6b7280',
  estandar: '#3b82f6',
  pro:      '#a855f7',
};

export default function NuevoAgentePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<Plan>('basico');
  const [features, setFeatures] = useState<AgentFeatures>(PLAN_FEATURES.basico);

  const handlePlanChange = (p: Plan) => {
    setPlan(p);
    setFeatures(PLAN_FEATURES[p]);
  };

  const toggleFeature = (key: keyof AgentFeatures) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      client_name:           fd.get('client_name'),
      business_name:         fd.get('business_name'),
      business_description:  fd.get('business_description'),
      business_address:      fd.get('business_address'),
      business_phone_display: fd.get('business_phone_display'),
      transfer_whatsapp:     fd.get('transfer_whatsapp'),
      calendar_url:          fd.get('calendar_url'),
      timezone:              fd.get('timezone') || 'America/Monterrey',
      phone_number:          fd.get('phone_number'),
      transfer_number:       fd.get('transfer_number'),
      knowledge_base:        fd.get('knowledge_base'),
      agent_name:            plan === 'pro' ? fd.get('agent_name') : null,
      plan,
      features,
      minutes_included:      PLAN_MINUTES[plan],
    };

    const res = await fetch('/api/admin/agentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/agentes/${data.id}`);
    } else {
      alert('Error al crear el agente');
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Nuevo agente</h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Configura el agente de voz para un cliente.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Plan selector */}
        <Section title="Plan">
          <div className="grid grid-cols-3 gap-3">
            {PLANS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => handlePlanChange(p)}
                className="p-3 rounded-xl border text-left transition-all"
                style={{
                  borderColor: plan === p ? PLAN_COLORS[p] : 'rgba(255,255,255,0.08)',
                  background: plan === p ? `${PLAN_COLORS[p]}18` : 'rgba(255,255,255,0.03)',
                }}
              >
                <div className="font-semibold text-white text-sm">{PLAN_LABELS[p]}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {PLAN_MINUTES[p]} min/mes
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Business info */}
        <Section title="Información del negocio">
          <Field label="Nombre del cliente (interno)" name="client_name" required />
          <Field label="Nombre del negocio" name="business_name" required placeholder="Ej: Clínica Dental Perez" />
          <Field label="Descripción del negocio" name="business_description" textarea placeholder="Qué hace el negocio, qué servicios ofrece..." />
          <Field label="Dirección" name="business_address" placeholder="Ej: Av. Constitución 100, Monterrey NL" />
          <Field label="Teléfono de contacto (que menciona el agente)" name="business_phone_display" placeholder="+52 81 1234 5678" />
          <Field label="WhatsApp del dueño (notificaciones)" name="transfer_whatsapp" placeholder="+52 81 1633 3559" />
          <Field label="Link de calendario (Calendly / Google Cal)" name="calendar_url" placeholder="https://calendly.com/..." />
          <Field label="Zona horaria" name="timezone" placeholder="America/Monterrey" />
          <Field label="Número Vapi (número que recibe las llamadas)" name="phone_number" placeholder="+19284158163" />
          <Field label="Número de transferencia (cuando el agente transfiere)" name="transfer_number" placeholder="+52 81 1633 3559" />
        </Section>

        {/* Agent name */}
        <Section title="Identidad del agente">
          <div className="p-3 rounded-lg mb-1" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ color: '#a855f7', fontWeight: 600 }}>Plan Pro</span> — En planes Básico y Estándar el agente se llama <strong style={{ color: 'rgba(255,255,255,0.7)' }}>CentinelIA</strong>. Con Pro puedes darle un nombre propio (ej: Sofía, Valeria, Carlos).
            </p>
          </div>
          <Field
            label="Nombre del agente"
            name="agent_name"
            placeholder="Ej: Sofía (solo Plan Pro)"
            disabled={plan !== 'pro'}
          />
        </Section>

        {/* Knowledge base */}
        <Section title="Base de conocimiento">
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Pega aquí el menú, catálogo de productos, precios, servicios y preguntas frecuentes del negocio.
            El agente usará esta información para responder preguntas durante las llamadas.
          </p>
          <Field
            label="Catálogo / precios / FAQs"
            name="knowledge_base"
            textarea
            rows={8}
            placeholder={`Ejemplo:\n\nSERVICIOS:\n- Corte de cabello: $150\n- Tinte completo: $450\n- Tratamiento: $300\n\nFAQs:\n¿Tienen estacionamiento? Sí, estacionamiento gratuito en la parte trasera.\n¿Aceptan tarjeta? Sí, todas las tarjetas.`}
          />
        </Section>

        {/* Feature toggles */}
        <Section title="Funcionalidades activas">
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Las marcadas por el plan pueden activarse o desactivarse individualmente.
          </p>
          <div className="flex flex-col gap-2">
            {(Object.keys(features) as (keyof AgentFeatures)[]).map(key => (
              <label key={key} className="flex items-center justify-between p-3 rounded-lg cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-sm" style={{ color: features[key] ? '#e2e8f0' : 'rgba(255,255,255,0.35)' }}>
                  {FEATURE_LABELS[key]}
                </span>
                <button
                  type="button"
                  onClick={() => toggleFeature(key)}
                  className="w-10 h-5 rounded-full transition-colors relative"
                  style={{ background: features[key] ? '#00e5ff' : 'rgba(255,255,255,0.15)' }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: features[key] ? '1.25rem' : '0.125rem' }}
                  />
                </button>
              </label>
            ))}
          </div>
        </Section>

        <button
          type="submit"
          disabled={saving}
          className="py-3 rounded-xl font-semibold text-sm transition-opacity"
          style={{ background: '#00e5ff', color: '#080d1a', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Creando agente…' : 'Crear agente'}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-3 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({ label, name, required, placeholder, textarea, rows, disabled }: {
  label: string; name: string; required?: boolean; placeholder?: string; textarea?: boolean; rows?: number; disabled?: boolean;
}) {
  const base = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '8px 12px',
    color: '#e2e8f0',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  };
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}{required && <span style={{ color: '#00e5ff' }}> *</span>}
      </label>
      {textarea
        ? <textarea name={name} rows={rows ?? 3} placeholder={placeholder} disabled={disabled} style={{ ...base, resize: 'vertical', opacity: disabled ? 0.4 : 1 }} />
        : <input name={name} required={required} placeholder={placeholder} disabled={disabled} style={{ ...base, opacity: disabled ? 0.4 : 1 }} />
      }
    </div>
  );
}
