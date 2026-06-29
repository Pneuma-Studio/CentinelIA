'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, RefreshCw, Check } from 'lucide-react';
import VoiceSelector from '@/components/VoiceSelector';
import { PLAN_FEATURES, PLAN_LABELS, PLAN_MINUTES, FEATURE_LABELS } from '@/types/agent';
import type { Plan, AgentFeatures, VoiceAgent, BusinessHours, DaySchedule } from '@/types/agent';

const PLANS: Plan[] = ['basico', 'estandar', 'pro'];
const PLAN_COLORS: Record<Plan, string> = {
  basico: '#6b7280', estandar: '#3b82f6', pro: '#a855f7',
};

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

type Tab = 'info' | 'agente' | 'funciones' | 'horarios' | 'contrato';
const TABS: { id: Tab; label: string }[] = [
  { id: 'info',      label: 'Información' },
  { id: 'agente',    label: 'Agente' },
  { id: 'funciones', label: 'Funciones' },
  { id: 'horarios',  label: 'Horarios' },
  { id: 'contrato',  label: 'Contrato' },
];

export default function EditAgentForm({ agent }: { agent: VoiceAgent }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const initialTab   = (searchParams.get('tab') as Tab | null) ?? 'info';
  const [saving, setSaving]               = useState(false);
  const [resyncing, setResyncing]         = useState(false);
  const [resyncOk, setResyncOk]           = useState(false);
  const [voiceId, setVoiceId]             = useState<string | null>((agent as any).elevenlabs_voice_id ?? null);
  const [tab, setTab]                     = useState<Tab>(initialTab);
  const [plan, setPlan]                   = useState<Plan>(agent.plan);
  const [features, setFeatures]           = useState<AgentFeatures>(agent.features);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(agent.business_hours ?? DEFAULT_HOURS);
  const [hoursEnabled, setHoursEnabled]   = useState<boolean>(!!agent.business_hours);

  const handlePlanChange = (p: Plan) => {
    setPlan(p);
    setFeatures(PLAN_FEATURES[p]);
  };

  const toggleFeature = (key: keyof AgentFeatures) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResyncWebsite = async () => {
    setResyncing(true);
    setResyncOk(false);
    const res = await fetch(`/api/admin/agentes/${agent.id}/resync-website`, { method: 'POST' });
    setResyncing(false);
    if (res.ok) { setResyncOk(true); setTimeout(() => setResyncOk(false), 4000); }
    else { const { error } = await res.json().catch(() => ({ error: 'Error' })); alert(error ?? 'No se pudo sincronizar'); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      client_name:            fd.get('client_name'),
      client_email:           fd.get('client_email') || null,
      business_name:          fd.get('business_name'),
      business_description:   fd.get('business_description'),
      business_address:       fd.get('business_address'),
      business_phone_display: fd.get('business_phone_display'),
      transfer_whatsapp:      fd.get('transfer_whatsapp'),
      transfer_number:        fd.get('transfer_number'),
      calendar_url:           fd.get('calendar_url'),
      business_website:       fd.get('business_website') || null,
      timezone:               fd.get('timezone') || 'America/Monterrey',
      phone_number:           fd.get('phone_number'),
      knowledge_base:         fd.get('knowledge_base'),
      agent_name:             plan === 'pro' ? fd.get('agent_name') : null,
      elevenlabs_voice_id:    voiceId ?? null,
      plan,
      features,
      business_hours:  hoursEnabled ? businessHours : null,
      minutes_included: PLAN_MINUTES[plan],
      contract_text:   (fd.get('contract_text') as string)?.trim() || null,
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
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/agentes/${agent.id}`} className="p-2 rounded-lg hover:bg-[var(--c-surface-2)] transition-colors" style={{ color: 'var(--c-text-2)' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>Editar agente</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--c-text-2)' }}>{agent.business_name}</p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: tab === t.id ? '#6C3BFF' : 'transparent', color: tab === t.id ? '#fff' : 'var(--c-text-3)' }}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Tab: Información */}
        <div className={tab !== 'info' ? 'hidden' : 'flex flex-col gap-6'}>
          <Section title="Plan">
            <div className="grid grid-cols-3 gap-3">
              {PLANS.map(p => (
                <button key={p} type="button" onClick={() => handlePlanChange(p)}
                  className="p-3 rounded-xl border text-left transition-all"
                  style={{
                    borderColor: plan === p ? PLAN_COLORS[p] : 'var(--c-border)',
                    background:  plan === p ? `${PLAN_COLORS[p]}18` : 'var(--c-surface)',
                  }}>
                  <div className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>{PLAN_LABELS[p]}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--c-text-2)' }}>{PLAN_MINUTES[p]} min/mes</div>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Datos del cliente">
            <Field label="Nombre del cliente (interno)" name="client_name" required defaultValue={agent.client_name} />
            <Field label="Email del cliente (alertas)" name="client_email" placeholder="cliente@email.com" defaultValue={(agent as any).client_email ?? ''} />
            <Field label="WhatsApp del dueño (notificaciones)" name="transfer_whatsapp" defaultValue={agent.transfer_whatsapp ?? ''} />
          </Section>

          <Section title="Información del negocio">
            <Field label="Nombre del negocio" name="business_name" required defaultValue={agent.business_name} />
            <Field label="Descripción del negocio" name="business_description" textarea defaultValue={agent.business_description} />
            <Field label="Dirección" name="business_address" defaultValue={agent.business_address ?? ''} />
            <Field label="Teléfono de contacto (que menciona el agente)" name="business_phone_display" defaultValue={agent.business_phone_display} />
            <Field label="Número de transferencia" name="transfer_number" defaultValue={agent.transfer_number ?? ''} />
            <Field label="Link de calendario" name="calendar_url" defaultValue={agent.calendar_url ?? ''} />
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--c-text-2)' }}>Sitio web del negocio</label>
              <div className="flex gap-2">
                <input name="business_website" placeholder="https://negocio.com" defaultValue={(agent as any).business_website ?? ''}
                  className="flex-1"
                  style={{ background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', borderRadius: 8, padding: '8px 12px', color: 'var(--c-text)', fontSize: 14, outline: 'none' }} />
                <button type="button" onClick={handleResyncWebsite} disabled={resyncing}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-opacity hover:opacity-80"
                  style={{
                    background: resyncOk ? 'rgba(34,197,94,0.1)' : 'rgba(108,59,255,0.08)',
                    color: resyncOk ? '#16a34a' : '#9B6DFF',
                    border: `1px solid ${resyncOk ? 'rgba(34,197,94,0.25)' : 'rgba(108,59,255,0.2)'}`,
                    opacity: resyncing ? 0.5 : 1,
                  }}>
                  {resyncing ? <RefreshCw size={11} className="animate-spin" /> : resyncOk ? <Check size={11} /> : <RefreshCw size={11} />}
                  {resyncing ? 'Sincronizando…' : resyncOk ? 'Listo' : 'Sincronizar'}
                </button>
              </div>
            </div>
            <Field label="Zona horaria" name="timezone" defaultValue={agent.timezone} />
            <Field label="Número Vapi" name="phone_number" defaultValue={agent.phone_number} />
          </Section>
        </div>

        {/* Tab: Agente */}
        <div className={tab !== 'agente' ? 'hidden' : 'flex flex-col gap-6'}>
          <Section title="Identidad del agente">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-xs" style={{ color: 'var(--c-text-2)' }}>
                <span style={{ color: '#a855f7', fontWeight: 600 }}>Plan Pro</span>, En planes Básico y Estándar el agente se llama <strong style={{ color: 'var(--c-text)' }}>Centinelia</strong>. Con Pro puedes darle un nombre propio.
              </p>
            </div>
            <Field label="Nombre del agente" name="agent_name"
              placeholder="Ej: Sofía (solo Plan Pro)"
              defaultValue={agent.agent_name ?? ''}
              disabled={plan !== 'pro'} />
          </Section>

          <Section title="Voz del agente">
            <p className="text-xs mb-1" style={{ color: 'var(--c-text-2)' }}>
              Elige la voz de ElevenLabs. Usa ▶ para escuchar una muestra antes de seleccionar.
            </p>
            <VoiceSelector selected={voiceId} onChange={setVoiceId} />
          </Section>

          <Section title="Base de conocimiento">
            <p className="text-xs" style={{ color: 'var(--c-text-2)' }}>
              Catálogo de productos, precios, servicios y preguntas frecuentes del negocio.
            </p>
            <Field label="Catálogo / precios / FAQs" name="knowledge_base" textarea rows={12}
              defaultValue={agent.knowledge_base ?? ''}
              placeholder={`SERVICIOS:\n- Ejemplo: $150\n\nFAQs:\n¿Aceptan tarjeta? Sí.`} />
          </Section>
        </div>

        {/* Tab: Funciones */}
        <div className={tab !== 'funciones' ? 'hidden' : 'flex flex-col gap-6'}>
          <Section title="Funcionalidades activas">
            <div className="flex flex-col gap-2">
              {(Object.keys(features) as (keyof AgentFeatures)[]).map(key => (
                <label key={key} className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
                  style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                  <span className="text-sm" style={{ color: features[key] ? 'var(--c-text)' : 'var(--c-text-3)' }}>
                    {FEATURE_LABELS[key]}
                  </span>
                  <button type="button" onClick={() => toggleFeature(key)}
                    className="w-10 h-5 rounded-full transition-colors relative"
                    style={{ background: features[key] ? '#6C3BFF' : 'var(--c-border-2)' }}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: features[key] ? '1.25rem' : '0.125rem' }} />
                  </button>
                </label>
              ))}
            </div>
          </Section>
        </div>

        {/* Tab: Horarios */}
        <div className={tab !== 'horarios' ? 'hidden' : 'flex flex-col gap-6'}>
          <Section title="Horario de atención">
            <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              <div>
                <div className="text-sm" style={{ color: 'var(--c-text)' }}>Restringir horario</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--c-text-2)' }}>
                  El agente solo contesta en el horario configurado
                </div>
              </div>
              <button type="button" onClick={() => setHoursEnabled(v => !v)}
                className="w-10 h-5 rounded-full transition-colors relative flex-shrink-0"
                style={{ background: hoursEnabled ? '#6C3BFF' : 'var(--c-border-2)' }}>
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: hoursEnabled ? '1.25rem' : '0.125rem' }} />
              </button>
            </label>

            {hoursEnabled && (
              <div className="flex flex-col gap-1">
                {DAYS.map(({ key, label }) => {
                  const s: DaySchedule = businessHours[key] ?? { open: false };
                  return (
                    <div key={key} className="grid grid-cols-[80px_1fr] items-center gap-3 px-3 py-2 rounded-lg"
                      style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <button type="button"
                          onClick={() => setBusinessHours(h => ({ ...h, [key]: { ...s, open: !s.open } }))}
                          className="w-8 h-4 rounded-full transition-colors relative flex-shrink-0"
                          style={{ background: s.open ? '#6C3BFF' : 'var(--c-border-2)' }}>
                          <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                            style={{ left: s.open ? '1rem' : '0.125rem' }} />
                        </button>
                        <span className="text-xs" style={{ color: s.open ? 'var(--c-text)' : 'var(--c-text-3)' }}>{label}</span>
                      </label>

                      {s.open ? (
                        <div className="flex items-center gap-2">
                          <input type="text" value={s.from ?? '09:00'} maxLength={5} placeholder="09:00"
                            onChange={e => {
                              let v = e.target.value.replace(/\D/g, '');
                              if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2, 4);
                              setBusinessHours(h => ({ ...h, [key]: { ...s, from: v } }));
                            }}
                            className="rounded px-2 py-1 text-xs outline-none w-14 text-center"
                            style={{ background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', color: 'var(--c-text)' }} />
                          <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>–</span>
                          <input type="text" value={s.to ?? '18:00'} maxLength={5} placeholder="18:00"
                            onChange={e => {
                              let v = e.target.value.replace(/\D/g, '');
                              if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2, 4);
                              setBusinessHours(h => ({ ...h, [key]: { ...s, to: v } }));
                            }}
                            className="rounded px-2 py-1 text-xs outline-none w-14 text-center"
                            style={{ background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', color: 'var(--c-text)' }} />
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--c-text-4)' }}>Cerrado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>

        {/* Tab: Contrato */}
        <div className={tab !== 'contrato' ? 'hidden' : 'flex flex-col gap-6'}>
          <Section title="Texto del contrato">
            <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(108,59,255,0.06)', border: '1px solid rgba(108,59,255,0.15)', color: 'var(--c-text-2)' }}>
              <strong style={{ color: '#9B6DFF' }}>Template automático activo.</strong> Si dejas este campo vacío, el contrato se genera automáticamente con los datos del agente (plan, funciones incluidas/excluidas, precio mensual, nombre del negocio). Solo escribe aquí si necesitas personalizar el texto para este cliente específico.
            </div>
            <Field
              label="Texto personalizado (opcional)"
              name="contract_text"
              textarea
              rows={16}
              placeholder={"Escribe el contrato personalizado aquí...\n\nSi lo dejas vacío se usa el template automático de Centinelia."}
              defaultValue={(agent as any).contract_text ?? ''}
            />
            {agent.portal_token && (
              <a
                href={`/portal/${agent.portal_token}/contrato`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs transition-opacity hover:opacity-80"
                style={{ color: '#9B6DFF' }}
              >
                <ExternalLink size={12} />
                Previsualizar contrato del cliente
              </a>
            )}
            {(agent as any).contract_accepted_at && (
              <div className="flex items-center gap-2 p-3 rounded-lg text-xs" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', color: '#16a34a' }}>
                ✓ Firmado por el cliente el {new Date((agent as any).contract_accepted_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            )}
          </Section>
        </div>

        <button type="submit" disabled={saving}
          className="py-3 rounded-xl font-semibold text-sm transition-opacity"
          style={{ background: '#6C3BFF', color: '#FAFBFF', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-3 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({ label, name, required, placeholder, textarea, rows, defaultValue, disabled }: {
  label: string; name: string; required?: boolean; placeholder?: string;
  textarea?: boolean; rows?: number; defaultValue?: string; disabled?: boolean;
}) {
  const base = {
    background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)',
    borderRadius: 8, padding: '8px 12px', color: 'var(--c-text)',
    fontSize: 14, width: '100%', outline: 'none',
  };
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: 'var(--c-text-2)' }}>
        {label}{required && <span style={{ color: '#9B6DFF' }}> *</span>}
      </label>
      {textarea
        ? <textarea name={name} rows={rows ?? 3} placeholder={placeholder} defaultValue={defaultValue} disabled={disabled} style={{ ...base, resize: 'vertical', opacity: disabled ? 0.4 : 1 }} />
        : <input name={name} required={required} placeholder={placeholder} defaultValue={defaultValue} disabled={disabled} style={{ ...base, opacity: disabled ? 0.4 : 1 }} />
      }
    </div>
  );
}
