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

function buildVapiAssistant(agent: VoiceAgent) {
  const voiceId = agent.elevenlabs_voice_id ?? process.env.ELEVENLABS_DEFAULT_VOICE_ID;
  const hasElevenLabs = !!voiceId && voiceId.length > 0;

  return {
    name: `CentinelIA — ${agent.business_name}`,
    model: {
      provider: 'anthropic',
      model: 'claude-haiku-4-5-20251001',
      messages: [{ role: 'system', content: buildSystemPrompt(agent) }],
    },
    voice: hasElevenLabs
      ? { provider: '11labs', voiceId, stability: 0.5, similarityBoost: 0.75, useSpeakerBoost: true }
      : { provider: 'vapi', voiceId: 'Valentina' },
    firstMessage: `Gracias por llamar a ${agent.business_name}. ¿En qué le puedo ayudar?`,
    endCallMessage: 'Fue un placer atenderle. ¡Que tenga un excelente día!',
    backgroundSound: 'office',
    backchannelingEnabled: true,
    serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/voice/webhook`,
    serverUrlSecret: process.env.VAPI_WEBHOOK_SECRET,
    analysisPlan: {
      summaryPrompt: 'Resume brevemente esta llamada: qué solicitó el cliente y cómo se resolvió.',
      successEvaluationPrompt: '¿Se resolvió la solicitud del cliente satisfactoriamente?',
      successEvaluationRubric: 'DescriptiveScale',
    },
    metadata: { agent_id: agent.id, plan: agent.plan },
  };
}

export async function createVapiAssistant(agent: VoiceAgent): Promise<string | null> {
  const res = await fetch(`${VAPI_URL}/assistant`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(buildVapiAssistant(agent)),
  });
  if (!res.ok) {
    console.error('Vapi createAssistant error:', await res.text());
    return null;
  }
  const data = await res.json();
  return data.id ?? null;
}

export async function updateVapiAssistant(vapiAssistantId: string, agent: VoiceAgent): Promise<boolean> {
  const res = await fetch(`${VAPI_URL}/assistant/${vapiAssistantId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(buildVapiAssistant(agent)),
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
