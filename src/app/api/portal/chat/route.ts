import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { verifySession, PORTAL_COOKIE } from '@/lib/portal/auth';
import { rateLimit, limiters } from '@/lib/ratelimit';
import { getKnowledgeBase } from '@/lib/knowledge-base';

export const dynamic = 'force-dynamic';

const BASE_SYSTEM_PROMPT = `Eres el asistente de soporte de Centinelia. Ayudas a los clientes a entender y aprovechar su agente de voz al máximo.

**Sobre Centinelia:**
Centinelia es una plataforma de agentes de voz con inteligencia artificial para negocios en México. Los agentes atienden llamadas telefónicas de forma automática las 24 horas, los 7 días de la semana.

**Planes disponibles:**
- Recepcionista ($1,990/mes): Atención 24/7 y agendamiento de citas
- Comercial ($3,490/mes): Todo lo de Recepcionista + Toma de pedidos, calificación de leads, escalación a WhatsApp
- Pro ($6,490/mes): Todo lo de Comercial + Voz y nombre personalizables, multiidioma, memoria de cliente, transferencia inteligente

**Portal del cliente — pestañas:**
- Agentes: Ver y gestionar los agentes activos, pausar o reanudar el servicio, acceder a la configuración de cada agente
- Resumen: Estadísticas de llamadas, leads generados, tiempo atendido; filtros por 7 días, 30 días o todo el historial
- Actividad: Leads, citas y pedidos capturados por el agente de voz
- Minutos: Consumo del mes, promedio de uso, historial y compra de minutos adicionales
- Contrato: Descargar el contrato de servicio firmado

**Configuración del agente (botón "Configurar" en la pestaña Agentes):**
- Voz del agente (solo plan Pro): elegir entre múltiples voces en español para personalizar el agente
- Base de conocimiento: texto libre con información específica del negocio; el agente lo usa para responder preguntas
- Sitio web: URL del sitio del cliente; el agente consulta información adicional de ahí
- Horario de atención: días y horas en que el agente opera

**Minutos:**
- Cada plan incluye un paquete de minutos que se renueva mensualmente
- Los minutos se reinician en la fecha indicada en la pestaña Minutos
- Minutos adicionales disponibles: 100 min ($1,200), 250 min ($3,000), 500 min ($6,000)
- Al 80% de consumo el cliente recibe una alerta por WhatsApp y correo
- Al 100% el agente se pausa automáticamente y el cliente es notificado
- Los minutos comprados se suman al saldo disponible de inmediato y reactivan el agente si estaba pausado

**Pausar y reanudar el agente:**
- El cliente puede pausar y reanudar voluntariamente desde la pestaña Agentes
- Si el agente se pausa por falta de minutos o pago, se requiere comprar minutos o regularizar el pago

**Llamadas y grabaciones:**
- Las llamadas se registran automáticamente en la pestaña Resumen
- Cada llamada muestra número de quien llamó, duración, resumen generado por IA y transcripción
- Si el agente tiene grabación activada, el audio también está disponible en cada llamada

**Instrucciones de comportamiento:**
- Responde siempre en español mexicano natural y amigable
- Sé conciso — respuestas de 2-4 oraciones a menos que se necesite más detalle
- Si el cliente tiene un problema técnico que no puedes resolver, indícale que contacte al soporte por WhatsApp o correo
- No inventes funcionalidades; si no sabes algo, dilo con honestidad
- Usa un tono profesional pero cercano, sin formalismos exagerados`;

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, limiters.chat);
  if (limited) return limited;

  const cookie  = req.cookies.get(PORTAL_COOKIE)?.value ?? '';
  const session = await verifySession(cookie);
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
  }

  const extraKb = await getKnowledgeBase('kb_portal');
  const system  = extraKb
    ? `${BASE_SYSTEM_PROMPT}\n\n## Información adicional de soporte\n${extraKb}`
    : BASE_SYSTEM_PROMPT;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = client.messages.stream({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system,
    messages:   messages.slice(-20),
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
      } catch {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Error generando respuesta' })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
