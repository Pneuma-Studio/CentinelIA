'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PLAN_FEATURES, PLAN_LABELS, PLAN_MINUTES, FEATURE_LABELS } from '@/types/agent';
import type { Plan, AgentFeatures, VoiceAgent } from '@/types/agent';

const PLANS: Plan[] = ['basico', 'estandar', 'pro'];
const PLAN_COLORS: Record<Plan, string> = {
  basico: '#6b7280', estandar: '#3b82f6', pro: '#a855f7',
};

export default function EditAgentForm({ agent }: { agent: VoiceAgent }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<Plan>(agent.plan);
  const [features, setFeatures] = useState<AgentFeatures>(agent.features);

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
      client_name:            fd.get('client_name'),
      business_name:          fd.get('business_name'),
      business_description:   fd.get('business_description'),
      business_address:       fd.get('business_address'),
      business_phone_display: fd.get('business_phone_display'),
      transfer_whatsapp:      fd.get('transfer_whatsapp'),
      transfer_number:        fd.get('transfer_number'),
      calendar_url:           fd.get('calendar_url'),
      timezone:               fd.get('timezone') || 'America/Monterrey',
      phone_number:           fd.get('phone_number'),
      knowledge_base:         fd.get('knowledge_base'),
      plan,
      features,
      minutes_included: PLAN_MINUTES[plan],
    };

    const res = await fetch(`/api/admin/agentes/${agent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push(`/admin/agentes/${agent.id}`);
      router.refresh();
    } else {
      alert('Error al guardar los cambios');
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/agentes/${agent.id}`} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Editar agente</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{agent.business_name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Plan */}
        <Section title="Plan">
          <div className="grid grid-cols-3 gap-3">
            {PLANS.map(p => (
              <button key={p} type="button" onClick={() => handlePlanChange(p)}
                className="p-3 rounded-xl border text-left transition-all"
                style={{
                  borderColor: plan === p ? PLAN_COLORS[p] : 'rgba(255,255,255,0.08)',
                  background:  plan === p ? `${PLAN_COLORS[p]}18` : 'rgba(255,255,255,0.03)',
                }}>
                <div className="font-semibold text-white text-sm">{PLAN_LABELS[p]}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{PLAN_MINUTES[p]} min/mes</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Business info */}
        <Section title="Información del negocio">
          <Field label="Nombre del cliente (interno)" name="client_name" required defaultValue={agent.client_name} />
          <Field label="Nombre del negocio" name="business_name" required defaultValue={agent.business_name} />
          <Field label="Descripción del negocio" name="business_description" textarea defaultValue={agent.business_description} />
          <Field label="Dirección" name="business_address" defaultValue={agent.business_address ?? ''} />
          <Field label="Teléfono de contacto (que menciona el agente)" name="business_phone_display" defaultValue={agent.business_phone_display} />
          <Field label="WhatsApp del dueño (notificaciones)" name="transfer_whatsapp" defaultValue={agent.transfer_whatsapp ?? ''} />
          <Field label="Número de transferencia" name="transfer_number" defaultValue={agent.transfer_number ?? ''} />
          <Field label="Link de calendario" name="calendar_url" defaultValue={agent.calendar_url ?? ''} />
          <Field label="Zona horaria" name="timezone" defaultValue={agent.timezone} />
          <Field label="Número Vapi" name="phone_number" defaultValue={agent.phone_number} />
        </Section>

        {/* Knowledge base */}
        <Section title="Base de conocimiento">
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Catálogo de productos, precios, servicios y preguntas frecuentes del negocio.
          </p>
          <Field label="Catálogo / precios / FAQs" name="knowledge_base" textarea rows={8}
            defaultValue={agent.knowledge_base ?? ''}
            placeholder={`SERVICIOS:\n- Ejemplo: $150\n\nFAQs:\n¿Aceptan tarjeta? Sí.`} />
        </Section>

        {/* Features */}
        <Section title="Funcionalidades activas">
          <div className="flex flex-col gap-2">
            {(Object.keys(features) as (keyof AgentFeatures)[]).map(key => (
              <label key={key} className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-sm" style={{ color: features[key] ? '#e2e8f0' : 'rgba(255,255,255,0.35)' }}>
                  {FEATURE_LABELS[key]}
                </span>
                <button type="button" onClick={() => toggleFeature(key)}
                  className="w-10 h-5 rounded-full transition-colors relative"
                  style={{ background: features[key] ? '#00e5ff' : 'rgba(255,255,255,0.15)' }}>
                  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: features[key] ? '1.25rem' : '0.125rem' }} />
                </button>
              </label>
            ))}
          </div>
        </Section>

        <button type="submit" disabled={saving}
          className="py-3 rounded-xl font-semibold text-sm transition-opacity"
          style={{ background: '#00e5ff', color: '#080d1a', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
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

function Field({ label, name, required, placeholder, textarea, rows, defaultValue }: {
  label: string; name: string; required?: boolean; placeholder?: string;
  textarea?: boolean; rows?: number; defaultValue?: string;
}) {
  const base = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '8px 12px', color: '#e2e8f0',
    fontSize: 14, width: '100%', outline: 'none',
  };
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}{required && <span style={{ color: '#00e5ff' }}> *</span>}
      </label>
      {textarea
        ? <textarea name={name} rows={rows ?? 3} placeholder={placeholder} defaultValue={defaultValue} style={{ ...base, resize: 'vertical' }} />
        : <input name={name} required={required} placeholder={placeholder} defaultValue={defaultValue} style={base} />
      }
    </div>
  );
}
