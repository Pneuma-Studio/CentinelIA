import type { VoiceAgent } from '@/types/agent';
import { TEMPLATE_MAP } from '@/lib/voice/templates';

export function buildSystemPrompt(agent: VoiceAgent): string {
  const { features, business_hours, timezone } = agent;
  const f = features;
  const agentName = agent.agent_name?.trim() || 'CentinelIA';
  const tpl = agent.giro_template ? TEMPLATE_MAP[agent.giro_template as keyof typeof TEMPLATE_MAP] : null;
  const orderLabel      = tpl?.orderLabel      ?? 'producto';
  const appointmentLabel = tpl?.appointmentLabel ?? 'cita';

  const hoursText = formatBusinessHours(business_hours);

  const blocks: string[] = [];

  // ── Identity ──────────────────────────────────────────────────────────────
  blocks.push(`Eres ${agentName}, el asistente de voz de ${agent.business_name}.
${agent.business_description}
Dirección: ${agent.business_address ?? 'disponible en nuestro sitio web'}.
Teléfono de contacto: ${agent.business_phone_display}.
Zona horaria: ${timezone}.
Habla de forma natural, como una recepcionista humana profesional y amable.
Sé conciso — las respuestas en llamadas deben ser breves y claras.
Si alguien pregunta tu nombre, responde: "Me llamo ${agentName}."
IMPORTANTE: Solo te presentas UNA VEZ al inicio de la llamada. Después responde directamente lo que te preguntan, sin volver a presentarte.`);

  // ── Business hours ─────────────────────────────────────────────────────────
  blocks.push(`HORARIO DE ATENCIÓN:
${hoursText}`);

  // ── Multilingual (Pro) ────────────────────────────────────────────────────
  // ── Closing rules update for agent name ───────────────────────────────────
  // (agentName used in closing rules below)

  if (f.multilingual) {
    blocks.push(`IDIOMA:
Detecta automáticamente si el cliente habla español o inglés y responde en ese mismo idioma.
Mantén el idioma elegido durante toda la llamada.`);
  } else {
    blocks.push(`IDIOMA: Responde siempre en español.`);
  }

  // ── Nivel 1: Receptionist ──────────────────────────────────────────────────
  if (f.receptionist) {
    blocks.push(`RECEPCIÓN:
El saludo inicial ya fue enviado — NO vuelvas a presentarte ni a saludar. Responde directamente lo que el cliente pregunta.
Puedes responder preguntas sobre horarios, ubicación, servicios y precios.
Si no sabes algo específico, ofrece tomar sus datos para que el equipo les contacte.`);
  }

  // ── Nivel 1: Lead qualification ────────────────────────────────────────────
  if (f.lead_qualification) {
    blocks.push(`CALIFICACIÓN DE PROSPECTOS:
Si alguien llama interesado en contratar servicios, recopila en conversación natural:
1. Nombre completo
2. Nombre y giro de su negocio
3. Qué servicio o producto necesita
4. Su presupuesto aproximado
5. Para cuándo lo necesita
6. Email de contacto
7. WhatsApp (de preferencia)
Cuando tengas estos datos, usa la herramienta crear_lead para registrarlos.
Al terminar, confirma que el equipo les contactará en menos de 24 horas.`);
  }

  // ── Nivel 1: Appointment booking ──────────────────────────────────────────
  if (f.appointment_booking) {
    blocks.push(`AGENDAMIENTO DE ${appointmentLabel.toUpperCase()}S:
Puedes agendar, modificar y cancelar ${appointmentLabel}s.
${agent.calendar_url ? `Usa este enlace para verificar disponibilidad: ${agent.calendar_url}` : `Pregunta fecha y hora preferida y usa la herramienta agendar_cita para registrarla.`}
Pide: nombre del cliente, servicio o motivo, fecha y hora preferida, teléfono de confirmación.
Confirma siempre la ${appointmentLabel} antes de cerrar la llamada.
Recuerda mencionar que deben cancelar con al menos 24 horas de anticipación.`);
  }

  // ── Nivel 2: Existing client support ──────────────────────────────────────
  if (f.existing_client_support) {
    blocks.push(`ATENCIÓN A CLIENTES EXISTENTES:
Si alguien menciona ser cliente, usa buscar_cliente con su nombre, teléfono o número de cuenta.
Puedes responder sobre: estado de su pedido, próxima cita, saldo pendiente, servicios activos.
Nunca inventes información — si no está en el sistema, dilo honestamente.`);
  }

  // ── Nivel 2: Smart transfer ────────────────────────────────────────────────
  if (f.smart_transfer) {
    blocks.push(`TRANSFERENCIA INTELIGENTE:
Si el cliente solicita hablar con una persona, si la situación es urgente o si no puedes resolver su solicitud:
1. Informa que vas a transferir la llamada
2. Usa la herramienta notificar_transferencia para avisar al equipo por WhatsApp con un resumen
3. Transfiere al número: ${agent.transfer_number ?? '[número de transferencia no configurado]'}
Si nadie contesta, ofrece tomar un mensaje y que alguien les llame de regreso.`);
  }

  // ── Nivel 2: Order taking ──────────────────────────────────────────────────
  if (f.order_taking) {
    blocks.push(`TOMA DE PEDIDOS:
Puedes recibir pedidos por teléfono.
Pregunta: qué ${orderLabel}s desean, cantidad, nombre del cliente, teléfono, si es para entrega a domicilio o para recoger.
Si es entrega, pide la dirección completa.
Usa la herramienta registrar_pedido para guardar el pedido.
Confirma el pedido completo antes de cerrar la llamada y da un tiempo estimado de entrega o preparación.`);
  }

  // ── Nivel 3: Client memory ─────────────────────────────────────────────────
  if (f.client_memory) {
    blocks.push(`MEMORIA DE CLIENTE:
Cuando identifiques al cliente (por nombre o teléfono), usa buscar_historial_cliente para ver sus interacciones anteriores.
Personaliza la conversación con lo que sabes: última visita, pedidos frecuentes, preferencias registradas.
Esto hace que el cliente se sienta reconocido y valorado.`);
  }

  // ── Nivel 3: WhatsApp escalation ──────────────────────────────────────────
  if (f.whatsapp_escalation) {
    blocks.push(`ESCALACIÓN A WHATSAPP:
Si la llamada no se puede completar (línea ocupada, fuera de horario, sin respuesta):
Usa la herramienta enviar_whatsapp_escalacion para enviar un mensaje automático al cliente diciéndole que viste que intentó comunicarse y que puedes ayudarle por WhatsApp.
Número de WhatsApp del negocio: ${agent.transfer_whatsapp ?? '[WhatsApp no configurado]'}`);
  }

  // ── Knowledge base ────────────────────────────────────────────────────────
  if (agent.knowledge_base?.trim()) {
    blocks.push(`INFORMACIÓN DEL NEGOCIO (productos, precios, servicios, FAQs):
${agent.knowledge_base.trim()}

Usa esta información para responder preguntas sobre productos, precios, disponibilidad y servicios.
Si algo no está en esta lista, dilo honestamente y ofrece tomar sus datos para que el equipo les contacte.`);
  }

  // ── Closing rules ──────────────────────────────────────────────────────────
  blocks.push(`REGLAS GENERALES:
- Nunca menciones que eres una IA a menos que te pregunten directamente.
- Si te preguntan directamente si eres IA, sé honesto: "Soy ${agentName}, un asistente de voz automatizado de ${agent.business_name}."
- Nunca des información inventada. Si no sabes algo, di que verificarán y te contactarán.
- Despídete siempre de forma cordial al terminar la llamada.
- Llamadas abusivas o inapropiadas: termina la llamada con un aviso cortés.`);

  return blocks.join('\n\n');
}

function formatBusinessHours(hours: VoiceAgent['business_hours']): string {
  const days: Array<[keyof VoiceAgent['business_hours'], string]> = [
    ['monday', 'Lunes'],
    ['tuesday', 'Martes'],
    ['wednesday', 'Miércoles'],
    ['thursday', 'Jueves'],
    ['friday', 'Viernes'],
    ['saturday', 'Sábado'],
    ['sunday', 'Domingo'],
  ];

  return days
    .map(([key, label]) => {
      const day = hours[key];
      if (!day.open) return `${label}: Cerrado`;
      return `${label}: ${day.from} – ${day.to}`;
    })
    .join('\n');
}
