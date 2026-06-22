import { buildSystemPrompt } from '@/lib/voice/prompt-builder';
import type { VoiceAgent } from '@/types/agent';

const VAPI_URL = 'https://api.vapi.ai';
const VAPI_KEY = process.env.VAPI_API_KEY!;

function headers() {
  return {
    'Authorization': `Bearer ${VAPI_KEY}`,
    'Content-Type': 'application/json',
  };
}

async function createVapiTools(agent: VoiceAgent): Promise<string[]> {
  const base = `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/tools`;
  const id = agent.id;
  const tools = [];

  if (agent.features.lead_qualification) {
    tools.push({
      type: 'function',
      function: {
        name: 'crear_lead',
        description: 'Registra los datos de un prospecto interesado en contratar servicios.',
        parameters: {
          type: 'object',
          properties: {
            nombre:      { type: 'string', description: 'Nombre completo del prospecto' },
            negocio:     { type: 'string', description: 'Nombre del negocio' },
            giro:        { type: 'string', description: 'Giro o industria del negocio' },
            servicio:    { type: 'string', description: 'Servicio que necesita' },
            presupuesto: { type: 'string', description: 'Presupuesto aproximado' },
            timeline:    { type: 'string', description: 'Para cuándo lo necesita' },
            email:       { type: 'string', description: 'Correo electrónico' },
            whatsapp:    { type: 'string', description: 'Número de WhatsApp' },
          },
          required: ['nombre', 'servicio'],
        },
      },
      server: { url: `${base}/crear-lead?agent_id=${id}` },
    });
  }

  if (agent.features.appointment_booking) {
    tools.push({
      type: 'function',
      function: {
        name: 'agendar_cita',
        description: 'Agenda, modifica o cancela una cita.',
        parameters: {
          type: 'object',
          properties: {
            accion:   { type: 'string', enum: ['agendar', 'modificar', 'cancelar'], description: 'Acción a realizar' },
            nombre:   { type: 'string', description: 'Nombre del cliente' },
            servicio: { type: 'string', description: 'Servicio para la cita' },
            fecha:    { type: 'string', description: 'Fecha de la cita (ej: lunes 23 de junio)' },
            hora:     { type: 'string', description: 'Hora de la cita' },
            telefono: { type: 'string', description: 'Teléfono de confirmación' },
          },
          required: ['accion', 'nombre'],
        },
      },
      server: { url: `${base}/agendar-cita?agent_id=${id}` },
    });
  }

  if (agent.features.order_taking) {
    tools.push({
      type: 'function',
      function: {
        name: 'registrar_pedido',
        description: 'Registra un pedido por teléfono.',
        parameters: {
          type: 'object',
          properties: {
            nombre:    { type: 'string', description: 'Nombre del cliente' },
            telefono:  { type: 'string', description: 'Teléfono del cliente' },
            items:     { type: 'string', description: 'Descripción de los productos o servicios pedidos' },
            tipo:      { type: 'string', enum: ['entrega', 'recoger'], description: 'Entrega a domicilio o recoger en sucursal' },
            direccion: { type: 'string', description: 'Dirección de entrega (solo si tipo es entrega)' },
            notas:     { type: 'string', description: 'Notas adicionales del pedido' },
          },
          required: ['nombre', 'items', 'tipo'],
        },
      },
      server: { url: `${base}/registrar-pedido?agent_id=${id}` },
    });
  }

  if (agent.features.smart_transfer) {
    tools.push({
      type: 'function',
      function: {
        name: 'notificar_transferencia',
        description: 'Notifica al equipo por WhatsApp antes de transferir la llamada a un humano.',
        parameters: {
          type: 'object',
          properties: {
            nombre:  { type: 'string', description: 'Nombre del cliente' },
            motivo:  { type: 'string', description: 'Motivo de la transferencia' },
            resumen: { type: 'string', description: 'Resumen breve de la conversación' },
          },
          required: ['motivo'],
        },
      },
      server: { url: `${base}/notificar-transferencia?agent_id=${id}` },
    });
  }

  const ids: string[] = [];
  for (const tool of tools) {
    const res = await fetch(`${VAPI_URL}/tool`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(tool),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.id) ids.push(data.id);
    } else {
      console.error('Vapi createTool error:', tool.function.name, await res.text());
    }
  }
  return ids;
}

function buildVapiAssistant(agent: VoiceAgent, toolIds: string[] = []) {
  const agentName = agent.agent_name?.trim() || 'CentinelIA';

  return {
    name: `${agentName} — ${agent.business_name}`,
    model: {
      provider: 'anthropic',
      model: 'claude-3-5-haiku-20241022',
      messages: [{ role: 'system', content: buildSystemPrompt(agent) }],
      temperature: 0.4,
      maxTokens: 300,
    },
    // Azure TTS while Vapi's ElevenLabs credential endpoint is broken (server-side bug)
    voice: { provider: 'azure', voiceId: 'es-MX-DaliaNeural' },
    firstMessage: `Gracias por llamar a ${agent.business_name}, le habla ${agentName}. En que le puedo ayudar?`,
    endCallMessage: 'Hasta luego, que tenga un excelente día.',
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'multi',
      smartFormat: true,
    },
    backgroundSound: 'office',
    backchannelingEnabled: false,
    backgroundDenoisingEnabled: true,
    silenceTimeoutSeconds: 20,
    maxDurationSeconds: 1800,
    serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/webhook`,
    serverUrlSecret: process.env.VAPI_WEBHOOK_SECRET,
    analysisPlan: {
      summaryPrompt: 'Resume brevemente esta llamada en 2-3 oraciones: qué solicitó el cliente y cómo se resolvió.',
      successEvaluationPrompt: '¿Se resolvió la solicitud del cliente satisfactoriamente?',
      successEvaluationRubric: 'DescriptiveScale',
      structuredDataPrompt: 'Extrae la información recopilada en esta llamada. Solo incluye campos que el cliente mencionó explícitamente.',
      structuredDataSchema: {
        type: 'object',
        properties: {
          nombre:       { type: 'string',  description: 'Nombre completo del cliente' },
          negocio:      { type: 'string',  description: 'Nombre del negocio del cliente' },
          giro:         { type: 'string',  description: 'Giro o industria del negocio' },
          servicio:     { type: 'string',  description: 'Servicio o producto que necesita' },
          presupuesto:  { type: 'string',  description: 'Presupuesto mencionado' },
          timeline:     { type: 'string',  description: 'Para cuándo lo necesita' },
          email:        { type: 'string',  description: 'Email de contacto' },
          whatsapp:     { type: 'string',  description: 'Número de WhatsApp o teléfono' },
          cita_fecha:   { type: 'string',  description: 'Fecha de cita agendada si aplica' },
          cita_hora:    { type: 'string',  description: 'Hora de cita agendada si aplica' },
          pedido_items: { type: 'string',  description: 'Productos o platillos pedidos si aplica' },
          pedido_tipo:  { type: 'string',  description: 'Entrega o recoger si aplica' },
          tipo_contacto:{ type: 'string',  description: 'lead | cita | pedido | informacion | transferencia' },
        },
      },
    },
    metadata: { agent_id: agent.id, plan: agent.plan },
  };
}

export async function createVapiAssistant(agent: VoiceAgent): Promise<string | null> {
  const toolIds = await createVapiTools(agent);
  const res = await fetch(`${VAPI_URL}/assistant`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(buildVapiAssistant(agent, toolIds)),
  });
  if (!res.ok) {
    console.error('Vapi createAssistant error:', await res.text());
    return null;
  }
  const data = await res.json();
  return data.id ?? null;
}

export async function updateVapiAssistant(vapiAssistantId: string, agent: VoiceAgent): Promise<boolean> {
  const toolIds = await createVapiTools(agent);
  const res = await fetch(`${VAPI_URL}/assistant/${vapiAssistantId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(buildVapiAssistant(agent, toolIds)),
  });
  if (!res.ok) {
    console.error('Vapi updateAssistant error:', await res.text());
    return false;
  }
  return true;
}

export async function assignAssistantToPhone(phoneNumber: string, vapiAssistantId: string): Promise<boolean> {
  // Find the Vapi phone number ID by number
  const listRes = await fetch(`${VAPI_URL}/phone-number`, { headers: headers() });
  if (!listRes.ok) return false;

  const phones: Array<{ id: string; number: string }> = await listRes.json();
  const phone = phones.find(p => p.number === phoneNumber);
  if (!phone) {
    console.error('Vapi phone not found for number:', phoneNumber);
    return false;
  }

  const res = await fetch(`${VAPI_URL}/phone-number/${phone.id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ assistantId: vapiAssistantId }),
  });
  if (!res.ok) {
    console.error('Vapi assignAssistant error:', await res.text());
    return false;
  }
  return true;
}
