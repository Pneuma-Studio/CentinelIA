import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildSystemPrompt } from '@/lib/voice/prompt-builder';
import { isWithinBusinessHours, nextOpenTime } from '@/lib/voice/business-hours';
import type { VoiceAgent } from '@/types/agent';

// Vapi calls this endpoint when a call comes in on an assigned phone number.
// We respond with the agent configuration (system prompt + tools) for this caller.
export async function POST(req: NextRequest) {
  const vapiSecret = process.env.VAPI_SERVER_SECRET;
  if (vapiSecret && req.nextUrl.searchParams.get('secret') !== vapiSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
  const agentName  = typedAgent.agent_name?.trim() || 'Centinelia';

  // Proactive caller lookup for client memory (Pro) and existing_client_support
  let callerName    = '';
  let callerContext = '';
  const f = typedAgent.features ?? {};
  if (phoneNumber && (f.client_memory || f.existing_client_support)) {
    const normPhone = phoneNumber.replace(/\D/g, '').slice(-10);

    const [leadRes, histRes] = await Promise.all([
      supabase
        .from('leads_voice')
        .select('nombre, servicio, negocio')
        .eq('agent_id', typedAgent.id)
        .ilike('whatsapp', `%${normPhone}%`)
        .order('created_at', { ascending: false })
        .limit(1),
      supabase
        .from('voice_calls')
        .select('summary, outcome, created_at')
        .eq('agent_id', typedAgent.id)
        .ilike('caller_number', `%${normPhone}%`)
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    const lead     = leadRes.data?.[0] ?? null;
    const history  = histRes.data ?? [];

    if (lead?.nombre || history.length > 0) {
      const parts: string[] = [];
      if (lead?.nombre)   parts.push(`Nombre: ${lead.nombre}`);
      if (lead?.negocio)  parts.push(`Negocio: ${lead.negocio}`);
      if (lead?.servicio) parts.push(`Servicio de interés: ${lead.servicio}`);
      if (history.length > 0) {
        parts.push(`Ha llamado antes ${history.length} vez${history.length > 1 ? 'es' : ''}.`);
        if (history[0].summary) parts.push(`Última vez: ${history[0].summary}`);
      }
      callerName    = lead?.nombre ?? '';
      callerContext = `\n\nCONTEXTO DEL LLAMANTE (${phoneNumber}):\n${parts.join('\n')}\nNO preguntes su nombre — ya lo tienes. Salúdale por su nombre de pila y continúa la conversación naturalmente.`;
    }
  }

  // Check business hours — respond with closed message if outside schedule
  if (!isWithinBusinessHours(typedAgent.business_hours, typedAgent.timezone)) {
    const next = typedAgent.business_hours ? nextOpenTime(typedAgent.business_hours, typedAgent.timezone) : null;
    const closedMsg = next
      ? `Gracias por llamar a ${typedAgent.business_name}. En este momento estamos cerrados. Puedes llamarnos de nuevo ${next}. ¡Hasta luego!`
      : `Gracias por llamar a ${typedAgent.business_name}. En este momento estamos fuera de horario. Por favor intenta más tarde.`;

    return NextResponse.json({
      assistant: {
        name: 'Closed',
        model: {
          provider: 'anthropic',
          model: 'claude-haiku-4-5-20251001',
          messages: [{ role: 'system', content: 'Eres una recepcionista. Di únicamente el mensaje de cierre y despídete.' }],
        },
        voice: {
          provider: '11labs',
          voiceId: typedAgent.elevenlabs_voice_id ?? process.env.ELEVENLABS_DEFAULT_VOICE_ID,
          model: 'eleven_turbo_v2_5',
          stability: 0.20,
          similarityBoost: 0.75,
          style: 0.55,
          speed: 1.1,
          useSpeakerBoost: true,
          optimizeStreamingLatency: 4,
        },
        firstMessage: closedMsg,
        endCallAfterSilenceSeconds: 5,
      },
    });
  }

  const systemPrompt = buildSystemPrompt(typedAgent) + callerContext;
  const tools = buildTools(typedAgent);

  const defaultGreeting = typedAgent.speech_style === 'tu'
    ? `Gracias por llamar a ${typedAgent.business_name}, te habla ${agentName}. ¿En qué te puedo ayudar?`
    : `Gracias por llamar a ${typedAgent.business_name}, le habla ${agentName}. ¿En qué le puedo ayudar?`;

  const firstMessage = callerName
    ? (typedAgent.speech_style === 'tu'
        ? `Hola ${callerName.split(' ')[0]}, ¿en qué te puedo ayudar hoy?`
        : `Hola ${callerName.split(' ')[0]}, ¿en qué le puedo ayudar hoy?`)
    : (typedAgent.first_message?.trim() || defaultGreeting);

  // Return Vapi-compatible assistant configuration
  return NextResponse.json({
    assistant: {
      name: `${agentName} — ${typedAgent.business_name}`,
      model: {
        provider: 'anthropic',
        model: 'claude-haiku-4-5-20251001',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.4,
        maxTokens: 300,
        tools,
      },
      voice: {
        provider: '11labs',
        voiceId: typedAgent.elevenlabs_voice_id ?? process.env.ELEVENLABS_DEFAULT_VOICE_ID,
        model: 'eleven_turbo_v2_5',
        stability: 0.20,
        similarityBoost: 0.75,
        style: 0.55,
        speed: 1.1,
        useSpeakerBoost: true,
        optimizeStreamingLatency: 4,
        chunkPlan: {
          enabled: true,
          minCharacters: 30,
          punctuationBoundaries: ['.', '!', '?', ',', ';', ':'],
        },
      },
      firstMessage,
      endCallMessage: 'Hasta luego, que tenga un excelente día.',
      endCallPhrases: ['hasta luego', 'hasta pronto', 'que tenga un excelente día', 'que tenga buen día', 'adiós', 'fue un placer atenderle'],
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: typedAgent.features.multilingual ? 'multi' : 'es',
        smartFormat: true,
        endpointing: 100,
      },
      backgroundSound: 'office',
      backchannelingEnabled: true,
      backgroundDenoisingEnabled: true,
      silenceTimeoutSeconds: 10,
      maxDurationSeconds: 1800,
      recordingEnabled: true,
      analysisPlan: {
        summaryPrompt: 'Resume esta llamada en 2-3 oraciones en texto plano, sin markdown, sin encabezados, sin negritas: qué quería el cliente y cómo terminó la llamada.',
        successEvaluationPrompt: '¿Se resolvió la solicitud del cliente satisfactoriamente?',
        successEvaluationRubric: 'DescriptiveScale',
        structuredDataPrompt: 'Extrae la información recopilada en esta llamada. Solo incluye campos que el cliente mencionó explícitamente.',
        structuredDataSchema: {
          type: 'object',
          properties: {
            nombre:        { type: 'string', description: 'Nombre completo del cliente' },
            negocio:       { type: 'string', description: 'Nombre del negocio del cliente' },
            giro:          { type: 'string', description: 'Giro o industria del negocio' },
            servicio:      { type: 'string', description: 'Servicio o producto que necesita' },
            presupuesto:   { type: 'string', description: 'Presupuesto mencionado' },
            timeline:      { type: 'string', description: 'Para cuándo lo necesita' },
            email:         { type: 'string', description: 'Email de contacto' },
            whatsapp:      { type: 'string', description: 'Número de WhatsApp o teléfono con código de país, ej: +528112345678' },
            cita_fecha:    { type: 'string', description: 'Fecha de la cita en formato YYYY-MM-DD' },
            cita_hora:     { type: 'string', description: 'Hora de la cita en formato HH:MM' },
            cita_telefono: { type: 'string', description: 'Teléfono de confirmación de la cita' },
            pedido_items:  { type: 'string', description: 'Productos o platillos pedidos si aplica' },
            pedido_tipo:   { type: 'string', description: 'Entrega o recoger si aplica' },
            tipo_contacto: { type: 'string', description: 'lead | cita | pedido | informacion | transferencia' },
          },
        },
      },
      messagePlan: {
        idleMessages: [
          '¿Sigues ahí?',
          '¿Hay algo más en lo que te pueda ayudar?',
          'Estoy aquí si necesitas algo.',
          'Tómate el tiempo que necesites.',
        ],
      },
      serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/webhook?secret=${process.env.VAPI_SERVER_SECRET ?? ''}`,
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
        description: 'Notifica al equipo por WhatsApp antes de transferir la llamada. Llama a esta herramienta PRIMERO, luego usa transferir_llamada.',
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

    if ((agent as any).transfer_number) {
      tools.push({
        type: 'transferCall',
        function: {
          name: 'transferir_llamada',
          description: 'Transfiere la llamada en tiempo real al equipo. Úsala DESPUÉS de notificar_transferencia.',
          parameters: { type: 'object', properties: {} },
        },
        destinations: [{
          type: 'number',
          number: (agent as any).transfer_number,
          message: 'Un momento por favor, te estoy comunicando con el equipo.',
        }],
        messages: [{
          type: 'request-start',
          content: 'Claro, con mucho gusto te comunico con el equipo ahora mismo.',
        }],
      });
    }
  }

  if (f.whatsapp_escalation) {
    tools.push({
      type: 'function',
      function: {
        name: 'enviar_whatsapp_escalacion',
        description: 'Envía un WhatsApp al cliente diciéndole que pueden atenderle por ese canal cuando la llamada no pudo resolverse.',
        parameters: {
          type: 'object',
          properties: {
            numero_cliente: { type: 'string', description: 'Número del cliente con código de país, ej: +528112345678' },
            motivo:         { type: 'string', description: 'Breve motivo de la escalación' },
          },
          required: ['numero_cliente'],
        },
        serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/tools/enviar-whatsapp-escalacion?agent_id=${agent.id}`,
      },
    });
  }

  return tools;
}
