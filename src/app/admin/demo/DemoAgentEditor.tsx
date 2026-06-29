'use client';

import { useState } from 'react';
import { Check, Loader2, Phone, ExternalLink } from 'lucide-react';
import type { VoiceAgent } from '@/types/agent';

const DEMO_INSTRUCTIONS = `MODO ESTANDAR -- Llamadas desde la landing o sin contexto previo

Cualquier persona puede llamarte para explorar como funciona un agente de voz. Tu objetivo es que vivan una experiencia de llamada real, no que sientan que estan hablando con un demo.

Si el cliente menciona que tipo de negocio quiere simular:
- Adoptalo de inmediato. No esperes mas confirmacion.
- Inventa un nombre creible, servicios coherentes y precios razonables para ese giro en Monterrey o Mexico.
- Mantente en ese papel durante toda la llamada.

Si el cliente no especifica nada, preguntale brevemente:
"Que tipo de negocio te gustaria que simulara hoy?"

Giros que puedes simular (no limitado a estos):
- Restaurante o cafeteria: toma pedidos para llevar o a domicilio, agenda reservaciones, responde sobre el menu, horarios y tiempo de espera
- Clinica o consultorio: agenda citas, responde sobre especialidades, precios de consulta y disponibilidad de doctores
- Despacho legal o contable: califica al prospecto, agenda una consulta inicial, explica los servicios del despacho
- Inmobiliaria: filtra por presupuesto, tipo de inmueble y zona; agenda visitas a propiedades
- Tienda o servicio: toma pedidos, consulta disponibilidad, gestiona entregas a domicilio
- Cualquier otro giro: adapta tu comportamiento con logica y naturalidad

--------------------------------------------------

MODO PRESENTACION -- Cuando Nazre esta mostrando el demo en persona

Si al inicio de la llamada alguien se identifica como Nazre (ej: "Soy Nazre", "Hola, soy yo, Nazre" o similar):

Paso 1 - Escucha el briefing
  Espera a que te de el contexto completo: donde esta, con quienes, que tipo de negocio, nombre del negocio, cualquier detalle del giro.
  No interrumpas -- dejalo hablar todo lo que necesite.

Paso 2 - Confirma brevemente
  Una sola frase corta y natural: "Perfecto, quedamos listos" o "Listo, ya entendi" o similar.
  No repitas todo lo que te dijo.

Paso 3 - Espera el nombre
  Cuando Nazre te diga el nombre o identidad que debes adoptar (ej: "Llamate Sofia" o "Ahora eres el agente de Clinica del Norte"), adoptalo completamente.

Paso 4 - Adopta el papel
  A partir de ese momento olvida que eres el demo de Centinelia. Eres el agente de ese negocio especifico.
  Atiende a los demas participantes exactamente como lo haria el agente real de ese negocio.

Durante la presentacion:
- Si no te dieron precios exactos, horarios u otros detalles especificos, improvisalos de forma verosimil para ese tipo de negocio en Mexico.
- Si Nazre necesita darte instrucciones adicionales durante la llamada, escuchalo brevemente y continua sin salir del personaje frente a los demas.
- Haz la experiencia lo mas natural e inmersiva posible. Los observadores deben sentir que estan llamando al negocio real, no a un demo.`;

function Field({ label, name, value, onChange, textarea, rows = 4, placeholder, hint }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  textarea?: boolean; rows?: number; placeholder?: string; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: 'var(--c-text-2)' }}>{label}</label>
      {hint && <p className="text-xs" style={{ color: 'var(--c-text-3)' }}>{hint}</p>}
      {textarea ? (
        <textarea
          name={name}
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-y font-mono"
          style={{ background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', color: 'var(--c-text)', lineHeight: 1.6 }}
        />
      ) : (
        <input
          name={name}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', color: 'var(--c-text)' }}
        />
      )}
    </div>
  );
}

export default function DemoAgentEditor({ agent }: { agent: VoiceAgent }) {
  const [agentName,    setAgentName]    = useState(agent.agent_name ?? '');
  const [description,  setDescription]  = useState(agent.business_description ?? '');
  const [knowledgeBase, setKnowledgeBase] = useState(agent.knowledge_base ?? '');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState('');

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    const res = await fetch(`/api/admin/agentes/${agent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_name:           agentName || null,
        business_description: description,
        knowledge_base:       knowledgeBase,
        // keep everything else unchanged
        client_name:            agent.client_name,
        client_email:           (agent as any).client_email ?? null,
        business_name:          agent.business_name,
        business_address:       agent.business_address ?? null,
        business_phone_display: agent.business_phone_display,
        transfer_whatsapp:      agent.transfer_whatsapp ?? null,
        transfer_number:        agent.transfer_number ?? null,
        calendar_url:           agent.calendar_url ?? null,
        business_website:       (agent as any).business_website ?? null,
        timezone:               agent.timezone,
        phone_number:           agent.phone_number,
        elevenlabs_voice_id:    (agent as any).elevenlabs_voice_id ?? null,
        plan:                   agent.plan,
        features:               agent.features,
        business_hours:         agent.business_hours ?? null,
        minutes_included:       agent.minutes_included,
        contract_text:          (agent as any).contract_text ?? null,
      }),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else { setError('Error al guardar. Revisa la consola.'); }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl flex flex-col gap-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(108,59,255,0.12)', color: '#9B6DFF' }}>
            Demo
          </span>
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--c-text-3)' }}>
            <Phone size={11} /> {agent.phone_number}
          </span>
        </div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>Agente demo</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--c-text-3)' }}>
          Configura cómo se comporta el agente durante presentaciones en vivo.
        </p>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-5 rounded-2xl p-6" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        <Field
          label="Nombre del agente"
          name="agent_name"
          value={agentName}
          onChange={setAgentName}
          placeholder="Centinelia"
          hint="El nombre con el que se presenta antes de adoptar un papel."
        />
        <Field
          label="Descripción de negocio (contexto por defecto)"
          name="business_description"
          value={description}
          onChange={setDescription}
          textarea
          rows={3}
          placeholder="Agente demo de Centinelia: adopta cualquier papel que se le indique."
        />
      </div>

      {/* Knowledge base */}
      <div className="flex flex-col gap-3 rounded-2xl p-6" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Instrucciones de modo demo</h2>
          <button
            type="button"
            onClick={() => setKnowledgeBase(DEMO_INSTRUCTIONS)}
            className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: 'rgba(108,59,255,0.1)', color: '#9B6DFF', border: '1px solid rgba(108,59,255,0.2)' }}
          >
            Insertar instrucciones base
          </button>
        </div>
        <p className="text-xs" style={{ color: 'var(--c-text-3)' }}>
          Aquí va el contexto que le da al agente el comportamiento de demo: escucha a Nazre, adopta el papel que le indican, improvisa detalles del negocio.
        </p>
        <textarea
          value={knowledgeBase}
          onChange={e => setKnowledgeBase(e.target.value)}
          rows={18}
          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-y font-mono"
          style={{ background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', color: 'var(--c-text)', lineHeight: 1.6 }}
          placeholder="Pega aquí las instrucciones de modo demo…"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
          style={{ background: saved ? '#22c55e' : '#6C3BFF', color: '#fff' }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
          {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar cambios'}
        </button>
        <a
          href={`/admin/agentes/${agent.id}/editar`}
          className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
          style={{ color: 'var(--c-text-3)' }}
        >
          <ExternalLink size={12} /> Editar completo
        </a>
        {error && <span className="text-xs" style={{ color: '#ef4444' }}>{error}</span>}
      </div>
    </div>
  );
}
