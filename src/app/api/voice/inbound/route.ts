import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildSystemPrompt } from '@/lib/voice/prompt-builder';
import type { VoiceAgent } from '@/types/agent';

// Vapi calls this endpoint when a call comes in on an assigned phone number.
// We respond with the agent configuration (system prompt + tools) for this caller.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message } = body;

  // Vapi sends a "call" message type for inbound calls
  const phoneNumber: string = message?.call?.customer?.number ?? '';
  const vapiPhoneNumber: string = message?.call?.phoneNumber?.number ?? '';

  const supabase = createAdminClient();

  // Find the agent assigned to this phone number
  const { data: agent, error } = await supabase
    .from('voice_agents')
    .select('*')
    .eq('phone_number', vapiPhoneNumber)
    .eq('active', true)
    .single();

  if (error || !agent) {
    return NextResponse.json(
      { error: 'No agent configured for this number' },
      { status: 404 }
    );
  }

  const typedAgent = agent as VoiceAgent;
  const systemPrompt = buildSystemPrompt(typedAgent);
  const tools = buildTools(typedAgent);

  // Return Vapi-compatible assistant configuration
  return NextResponse.json({
    assistant: {
      name: `${typedAgent.business_name} Assistant`,
      model: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-6',
        messages: [{ role: 'system', content: systemPrompt }],
        tools,
      },
      voice: {
        provider: 'elevenlabs',
        voiceId: typedAgent.elevenlabs_voice_id ?? process.env.ELEVENLABS_DEFAULT_VOICE_ID,
        stability: 0.5,
        similarityBoost: 0.75,
        useSpeakerBoost: true,
      },
      firstMessage: `Gracias por llamar a ${typedAgent.business_name}. ¿En qué le puedo ayudar?`,
      endCallMessage: 'Fue un placer atenderle. ¡Que tenga un excelente día!',
      backgroundSound: 'office',
      backchannelingEnabled: true,
      analysisPlan: {
        summaryPrompt: 'Resume brevemente esta llamada: qué solicitó el cliente y cómo se resolvió.',
        successEvaluationPrompt: '¿Se resolvió la solicitud del cliente satisfactoriamente?',
        successEvaluationRubric: 'DescriptiveScale',
      },
      metadata: {
        agent_id: typedAgent.id,
        plan: typedAgent.plan,
        caller_number: phoneNumber,
      },
    },
  });
}

function buildTools(agent: VoiceAgent) {
  const tools: object[] = [];
  const f = agent.features;

  if (f.lead_qualification) {
    tools.push({
      type: 'function',
      function: {
        name: 'crear_lead',
        description: 'Registra un nuevo prospecto interesado en los servicios del negocio.',
        parameters: {
          type: 'object',
          properties: {
            nombre:    { type: 'string', description: 'Nombre completo del prospecto' },
            negocio:   { type: 'string', description: 'Nombre de su negocio o empresa' },
            giro:      { type: 'string', description: 'A qué se dedica su negocio' },
            servicio:  { type: 'string', description: 'Qué servicio necesita' },
            presupuesto: { type: 'string', description: 'Presupuesto aproximado' },
            timeline:  { type: 'string', description: 'Para cuándo lo necesita' },
            email:     { type: 'string', description: 'Correo electrónico' },
            whatsapp:  { type: 'string', description: 'Número de WhatsApp' },
          },
          required: ['nombre', 'servicio'],
        },
        serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/tools/crear-lead?agent_id=${agent.id}`,
      },
    });
  }

  if (f.appointment_booking) {
    tools.push({
      type: 'function',
      function: {
        name: 'agendar_cita',
        description: 'Agenda, modifica o cancela una cita.',
        parameters: {
          type: 'object',
          properties: {
            accion:  { type: 'string', enum: ['agendar', 'modificar', 'cancelar'] },
            nombre:  { type: 'string', description: 'Nombre del cliente' },
            servicio: { type: 'string', description: 'Servicio o tipo de cita' },
            fecha:   { type: 'string', description: 'Fecha preferida (YYYY-MM-DD)' },
            hora:    { type: 'string', description: 'Hora preferida (HH:MM)' },
            telefono: { type: 'string', description: 'Teléfono de confirmación' },
          },
          required: ['accion', 'nombre', 'fecha'],
        },
        serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/tools/agendar-cita?agent_id=${agent.id}`,
      },
    });
  }

  if (f.existing_client_support || f.client_memory) {
    tools.push({
      type: 'function',
      function: {
        name: 'buscar_cliente',
        description: 'Busca información de un cliente existente por nombre o teléfono.',
        parameters: {
          type: 'object',
          properties: {
            identificador: { type: 'string', description: 'Nombre, teléfono o número de cliente' },
          },
          required: ['identificador'],
        },
        serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/tools/buscar-cliente?agent_id=${agent.id}`,
      },
    });
  }

  if (f.order_taking) {
    tools.push({
      type: 'function',
      function: {
        name: 'registrar_pedido',
        description: 'Registra un pedido recibido por teléfono.',
        parameters: {
          type: 'object',
          properties: {
            nombre:    { type: 'string', description: 'Nombre del cliente' },
            telefono:  { type: 'string', description: 'Teléfono del cliente' },
            items:     { type: 'string', description: 'Lista de productos y cantidades' },
            tipo:      { type: 'string', enum: ['entrega', 'recoger'], description: 'Entrega a domicilio o para recoger' },
            direccion: { type: 'string', description: 'Dirección si es entrega' },
            notas:     { type: 'string', description: 'Instrucciones especiales' },
          },
          required: ['nombre', 'items', 'tipo'],
        },
        serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/tools/registrar-pedido?agent_id=${agent.id}`,
      },
    });
  }

  if (f.smart_transfer) {
    tools.push({
      type: 'function',
      function: {
        name: 'notificar_transferencia',
        description: 'Notifica al equipo por WhatsApp antes de transferir la llamada.',
        parameters: {
          type: 'object',
          properties: {
            nombre:  { type: 'string', description: 'Nombre del cliente' },
            motivo:  { type: 'string', description: 'Razón de la transferencia' },
            resumen: { type: 'string', description: 'Resumen breve de la llamada hasta ahora' },
          },
          required: ['motivo'],
        },
        serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/tools/notificar-transferencia?agent_id=${agent.id}`,
      },
    });
  }

  return tools;
}
