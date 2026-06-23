export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/admin';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Settings } from 'lucide-react';
import { cookies } from 'next/headers';
import { verifySession, PORTAL_COOKIE } from '@/lib/portal/auth';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import type { BusinessHours } from '@/types/agent';

import PortalLogout           from '../PortalLogout';
import BusinessHoursEditor    from '../BusinessHoursEditor';
import KnowledgeBaseEditor    from '../KnowledgeBaseEditor';
import WebsiteSyncButton      from '../WebsiteSyncButton';
import PortalVoiceSelector    from '../PortalVoiceSelector';
import NotificationsToggle    from '../NotificationsToggle';
import SupportChat            from '../SupportChat';

const PLAN_LABELS: Record<string, string> = { basico: 'Básico', estandar: 'Estándar', pro: 'Pro' };
const PLAN_COLORS: Record<string, string> = { basico: '#6b7280', estandar: '#3b82f6', pro: '#a855f7' };

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ConfigurarAgentePage({ params }: Props) {
  const { token } = await params;

  const cookieStore   = await cookies();
  const sessionCookie = cookieStore.get(PORTAL_COOKIE)?.value ?? '';
  const session       = await verifySession(sessionCookie);

  const supabase = createAdminClient();
  const { data: agent } = await supabase
    .from('voice_agents').select('*').eq('portal_token', token).single();
  if (!agent) notFound();

  if (session?.portalEmail && agent.portal_email && agent.portal_email !== session.portalEmail) {
    redirect('/portal/login');
  }

  const agentName  = agent.agent_name?.trim() || 'CentinelIA';
  const planColor  = PLAN_COLORS[agent.plan] ?? '#6b7280';
  const planLabel  = PLAN_LABELS[agent.plan] ?? agent.plan;

  return (
    <ThemeProvider storageKey="centinelia-portal-theme" defaultTheme="dark">
      <div className="min-h-screen" style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}>

        {/* Header */}
        <div style={{ background: 'var(--c-surface)', borderBottom: '1px solid var(--c-border)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <Link
              href={`/portal/${token}?tab=agentes`}
              className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--c-text-2)' }}
            >
              <ChevronLeft size={16} />
              Agentes
            </Link>
            <div className="flex items-center gap-1.5">
              <ThemeToggle className="!text-[var(--c-text-2)] !bg-[var(--c-surface-2)]" />
              <PortalLogout />
            </div>
          </div>
        </div>

        {/* Agent identity header */}
        <div style={{ background: 'var(--c-surface)', borderBottom: '1px solid var(--c-border)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(108,59,255,0.1)', border: '1px solid rgba(108,59,255,0.2)' }}>
              <Settings size={16} color="#6C3BFF" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
                  {agentName}
                </p>
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: `${planColor}18`, color: planColor, border: `1px solid ${planColor}30` }}>
                  {planLabel}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>
                {agent.business_name}
              </p>
            </div>
          </div>
        </div>

        {/* Config sections */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

          {agent.plan === 'pro' && (
            <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              <h2 className="text-xs font-semibold mb-1 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>
                Voz del agente
              </h2>
              <p className="text-xs mb-4" style={{ color: 'var(--c-text-3)' }}>
                Elige la voz con la que tu agente atenderá las llamadas. Usa el botón ▶ para escuchar una muestra.
              </p>
              <PortalVoiceSelector token={token} currentVoiceId={(agent as any).elevenlabs_voice_id ?? null} />
            </div>
          )}

          <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <h2 className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>
              Base de conocimiento
            </h2>
            <KnowledgeBaseEditor token={token} initialValue={agent.knowledge_base ?? ''} />
          </div>

          <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <h2 className="text-xs font-semibold mb-1 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>
              Sitio web
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--c-text-3)' }}>
              Conecta tu sitio web para que el agente consulte información adicional desde ahí.
            </p>
            <WebsiteSyncButton token={token} currentUrl={(agent as any).business_website ?? null} />
          </div>

          <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>
              Horario de atención
            </h2>
            <BusinessHoursEditor token={token} initialHours={(agent.business_hours ?? null) as BusinessHours | null} />
          </div>

          <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <h2 className="text-xs font-semibold mb-1 tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>
              Notificaciones
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--c-text-3)' }}>
              Elige cómo quieres recibir la información de cada llamada.
            </p>
            <NotificationsToggle
              token={token}
              initWhatsApp={(agent as any).notify_whatsapp ?? true}
              initEmail={(agent as any).notify_email ?? true}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 px-4 sm:px-6 py-4" style={{ borderTop: '1px solid var(--c-border)' }}>
          <div className="max-w-4xl mx-auto">
            <span className="text-xs" style={{ color: 'var(--c-text-4)' }}>
              Powered by <span style={{ color: '#6C3BFF' }}>CentinelIA</span> · Pneuma Studio
            </span>
          </div>
        </div>

        <SupportChat />
      </div>
    </ThemeProvider>
  );
}
