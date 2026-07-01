const FROM  = process.env.RESEND_FROM_EMAIL ?? 'Centinelia <notificaciones@centinelia.mx>';
const LOGO  = 'https://www.centinelia.mx/logo.png';

const C = {
  bg:     '#FAFBFF',
  card:   '#FFFFFF',
  border: 'rgba(108,59,255,0.12)',
  accent: '#6C3BFF',
  text:   '#1A0A3B',
  sub:    'rgba(26,10,59,0.6)',
  mute:   'rgba(26,10,59,0.38)',
  header: '#1A0A3B',
};

// ── Inline SVG icons (Lucide style, stroke-based) ────────────────────────────

const ICONS = {
  phone: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 9.8a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.38A16 16 0 0 0 15.62 16.1l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,

  user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,

  calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,

  bag: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,

  chart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,

  clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,

  alert: (color: string) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,

  star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,

  card: (color: string) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,

  phoneOff: (color: string) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.31-2.85"/><path d="M9.58 5.7A19.63 19.63 0 0 0 4.07 9.8a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.38"/><line x1="23" y1="1" x2="1" y2="23"/></svg>`,

  sparkle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${C.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.05l-4.9 3.56a1 1 0 0 0-.36 1.12L17.5 20l-4.9-3.56a1 1 0 0 0-1.18 0L6.5 20l1.88-5.87a1 1 0 0 0-.36-1.12L3.12 9.45h6.05a1 1 0 0 0 .95-.69L12 3z"/></svg>`,
};

function iconCircle(svg: string, bg = `${C.accent}12`) {
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;background:${bg};border-radius:10px;flex-shrink:0">${svg}</span>`;
}

// ── Shell ─────────────────────────────────────────────────────────────────────

function shell(body: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px 48px">

    <div style="background:${C.header};border-radius:16px 16px 0 0;padding:28px 32px;text-align:center">
      <img src="${LOGO}" alt="Centinelia" width="140" height="38" style="width:140px;height:auto;display:inline-block" />
    </div>

    <div style="background:${C.card};border:1px solid ${C.border};border-top:none;border-radius:0 0 16px 16px;padding:32px">
      ${body}
    </div>

    <div style="text-align:center;padding:24px 0 0">
      <p style="color:${C.mute};font-size:12px;line-height:1.8;margin:0">
        <a href="https://www.centinelia.mx" style="color:${C.mute};text-decoration:none">centinelia.mx</a>
        &nbsp;·&nbsp;
        <a href="mailto:hola@centinelia.mx" style="color:${C.accent};text-decoration:none">hola@centinelia.mx</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function badge(icon: string, label: string, color = C.accent) {
  return `<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:20px">
    <span style="display:inline-flex;align-items:center;gap:6px;background:${color}12;border:1px solid ${color}30;border-radius:20px;padding:6px 14px">
      ${icon}
      <span style="color:${color};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">${label}</span>
    </span>
  </div>`;
}

function heading(title: string, sub?: string) {
  return `<h1 style="color:${C.text};font-size:22px;font-weight:700;margin:0 0 ${sub ? '6px' : '24px'};text-align:center;line-height:1.3">${title}</h1>
  ${sub ? `<p style="color:${C.sub};font-size:13px;margin:0 0 24px;text-align:center">${sub}</p>` : ''}`;
}

function infoCard(content: string, accent = false) {
  return `<div style="background:${accent ? `${C.accent}08` : '#f8f5ff'};border:1px solid ${accent ? `${C.accent}25` : C.border};border-radius:12px;padding:20px;margin-bottom:16px">
    ${content}
  </div>`;
}

function btn(label: string, href: string, primary = true) {
  return `<div style="text-align:center;margin:24px 0 8px">
    <a href="${href}" style="display:inline-block;background:${primary ? `linear-gradient(135deg,${C.accent},#9B6DFF)` : 'transparent'};border:${primary ? 'none' : `1.5px solid ${C.border}`};color:${primary ? '#fff' : C.sub};font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:12px">
      ${label}
    </a>
  </div>`;
}

function sectionLabel(text: string) {
  return `<p style="color:${C.mute};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 10px">${text}</p>`;
}

// ── sendEmail ─────────────────────────────────────────────────────────────────

export async function sendEmail(opts: {
  to:      string;
  subject: string;
  html:    string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.warn('Email not configured, missing RESEND_API_KEY'); return false; }

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html }),
  });

  if (!res.ok) { console.error('Email send error:', await res.text()); return false; }
  return true;
}

// ── Weekly report ─────────────────────────────────────────────────────────────

export function weeklyReportHtml(opts: {
  businessName: string;
  portalUrl:    string;
  period:       string;
  totalCalls:   number;
  leads:        number;
  appointments: number;
  orders:       number;
  minutesUsed:  number;
  minutesTotal: number;
  peakHour:     string | null;
}) {
  const pct      = opts.minutesTotal > 0 ? Math.round((opts.minutesUsed / opts.minutesTotal) * 100) : 0;
  const barColor = pct >= 80 ? '#DC2626' : pct >= 60 ? '#D97706' : C.accent;

  const stats: { icon: string; label: string; value: number; color: string }[] = [
    { icon: ICONS.phone,    label: 'Llamadas',  value: opts.totalCalls,   color: C.text },
    { icon: ICONS.user,     label: 'Leads',     value: opts.leads,        color: '#7C3AED' },
    { icon: ICONS.calendar, label: 'Citas',     value: opts.appointments, color: '#2563EB' },
    { icon: ICONS.bag,      label: 'Pedidos',   value: opts.orders,       color: '#D97706' },
  ].filter(s => s.value > 0);

  const statsRows = stats.map(s => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${C.border};vertical-align:middle">
        <span style="display:inline-flex;align-items:center;gap:10px">
          ${iconCircle(s.icon)}
          <span style="color:${C.sub};font-size:13px;font-weight:600">${s.label}</span>
        </span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid ${C.border};color:${s.color};font-size:24px;font-weight:700;text-align:right;line-height:1">${s.value}</td>
    </tr>`).join('');

  const minutesSection = infoCard(`
    ${sectionLabel('Minutos del plan')}
    <div style="background:${C.border};border-radius:6px;height:8px;overflow:hidden;margin-bottom:8px">
      <div style="height:100%;width:${Math.min(pct, 100)}%;background:${barColor};border-radius:6px"></div>
    </div>
    <p style="color:${C.sub};font-size:13px;margin:0">${opts.minutesUsed} de ${opts.minutesTotal} min usados <span style="color:${C.mute}">(${pct}%)</span></p>
    ${opts.peakHour ? `
    <p style="color:${C.mute};font-size:12px;margin:10px 0 0;display:flex;align-items:center;gap:5px">
      ${ICONS.clock} Hora pico: <strong style="color:${C.sub}">${opts.peakHour}</strong>
    </p>` : ''}
  `, true);

  return shell(`
    ${badge(ICONS.chart, 'Reporte semanal')}
    ${heading(opts.businessName, opts.period)}
    <div style="background:#f8f5ff;border:1px solid ${C.border};border-radius:12px;padding:4px 20px 4px;margin-bottom:16px">
      <table style="width:100%;border-collapse:collapse">${statsRows}</table>
    </div>
    ${minutesSection}
    ${btn('Ver portal completo →', opts.portalUrl)}
  `);
}

// ── Welcome ───────────────────────────────────────────────────────────────────

export function welcomeHtml(opts: { businessName: string; setupUrl: string }) {
  return shell(`
    ${badge(ICONS.sparkle, 'Bienvenido a Centinelia')}
    ${heading('Tu agente de voz estará listo pronto', opts.businessName)}
    <p style="color:${C.sub};font-size:14px;line-height:1.7;margin:0 0 16px">
      Tu pago fue procesado exitosamente. En las próximas horas asignaremos tu número de teléfono dedicado y te avisaremos por WhatsApp cuando tu agente esté en línea.
    </p>
    <p style="color:${C.sub};font-size:14px;line-height:1.7;margin:0 0 24px">
      Mientras tanto, configura tu acceso al portal para monitorear tus llamadas, leads y minutos:
    </p>
    ${btn('Acceder a mi portal →', opts.setupUrl)}
    ${infoCard(`
      ${sectionLabel('¿Qué sigue?')}
      <p style="color:${C.sub};font-size:13px;line-height:1.8;margin:0">
        1. Configura tu contraseña en el portal<br>
        2. Recibe tu número de teléfono (próximas horas)<br>
        3. Comparte el número con tus clientes y empieza a recibir llamadas 24/7
      </p>
    `, true)}
  `);
}

// ── New lead / call ───────────────────────────────────────────────────────────

export function newLeadHtml(opts: {
  businessName:  string;
  callerNumber:  string;
  nombre?:       string | null;
  servicio?:     string | null;
  whatsapp?:     string | null;
  email?:        string | null;
  summary?:      string | null;
  outcome:       string;
  portalUrl:     string;
}) {
  const outcomeIcons: Record<string, string> = {
    lead_created:       ICONS.user,
    appointment_booked: ICONS.calendar,
    order_taken:        ICONS.bag,
    transferred:        ICONS.phone,
    info_provided:      ICONS.phone,
    other:              ICONS.phone,
  };
  const outcomeLabels: Record<string, string> = {
    lead_created:       'Nuevo lead',
    appointment_booked: 'Cita agendada',
    order_taken:        'Pedido tomado',
    transferred:        'Llamada transferida',
    info_provided:      'Consulta atendida',
    other:              'Llamada completada',
  };

  function row(label: string, value: string | null | undefined) {
    if (!value?.trim()) return '';
    return `<tr>
      <td style="padding:9px 0;border-bottom:1px solid ${C.border};color:${C.mute};font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;width:110px;vertical-align:top">${label}</td>
      <td style="padding:9px 0;border-bottom:1px solid ${C.border};color:${C.text};font-size:14px;font-weight:500">${value}</td>
    </tr>`;
  }

  const rows = [
    row('Teléfono', opts.callerNumber),
    row('Nombre',   opts.nombre),
    row('Interés',  opts.servicio),
    row('WhatsApp', opts.whatsapp && opts.whatsapp !== opts.callerNumber ? opts.whatsapp : null),
    row('Email',    opts.email),
  ].join('');

  const summarySection = opts.summary ? infoCard(`
    ${sectionLabel('Resumen de la llamada')}
    <p style="color:${C.sub};font-size:13px;line-height:1.65;margin:0">${opts.summary}</p>
  `, true) : '';

  return shell(`
    ${badge(outcomeIcons[opts.outcome] ?? ICONS.phone, outcomeLabels[opts.outcome] ?? 'Llamada')}
    ${heading(opts.businessName, 'Tu agente de voz capturó nueva actividad')}
    <div style="background:#f8f5ff;border:1px solid ${C.border};border-radius:12px;padding:4px 20px 4px;margin-bottom:16px">
      <table style="width:100%;border-collapse:collapse">${rows}</table>
    </div>
    ${summarySection}
    ${btn('Ver en mi portal →', opts.portalUrl)}
  `);
}

// ── Minutes alert ─────────────────────────────────────────────────────────────

export function minutesAlertHtml(opts: {
  businessName: string;
  pct:          number;
  used:         number;
  included:     number;
  resetDate:    string;
  portalUrl:    string;
}) {
  const isPaused   = opts.pct >= 100;
  const alertColor = isPaused ? '#DC2626' : '#D97706';
  const bodyText   = isPaused
    ? `Tu agente <strong style="color:${C.text}">${opts.businessName}</strong> ha sido <strong style="color:#DC2626">pausado automáticamente</strong> al agotar los ${opts.included} minutos de tu plan. Puedes reactivarlo comprando minutos adicionales o cambiando de plan.`
    : `Tu agente <strong style="color:${C.text}">${opts.businessName}</strong> ha usado <strong style="color:#D97706">${opts.used} de ${opts.included} minutos</strong> (${Math.round(opts.pct)}%). Si necesitas más antes del ${opts.resetDate}, puedes comprar minutos adicionales o ampliar tu plan.`;

  return shell(`
    ${badge(ICONS.alert(alertColor), isPaused ? 'Agente pausado' : `${Math.round(opts.pct)}% de minutos usados`, alertColor)}
    ${heading(opts.businessName)}
    <p style="color:${C.sub};font-size:14px;line-height:1.7;margin:0 0 24px">${bodyText}</p>
    ${btn('Comprar más minutos →', `${opts.portalUrl}?tab=minutos`)}
    ${btn('Ampliar mi plan →', `${opts.portalUrl}?tab=minutos#suscripcion`, false)}
  `);
}

// ── Agent paused ──────────────────────────────────────────────────────────────

export function agentPausedHtml(businessName: string) {
  return shell(`
    ${badge(ICONS.phoneOff('#DC2626'), 'Agente pausado', '#DC2626')}
    ${heading(businessName)}
    <p style="color:${C.sub};font-size:14px;line-height:1.7;margin:0">
      El período de gracia de 3 días venció sin recibir el pago de tu suscripción Centinelia.
      Tu agente de voz ha sido <strong style="color:${C.text}">pausado</strong>.
      Para reactivarlo, actualiza tu método de pago o contáctanos a
      <a href="mailto:hola@centinelia.mx" style="color:${C.accent};text-decoration:none">hola@centinelia.mx</a>.
    </p>
  `);
}

// ── Payment failed ────────────────────────────────────────────────────────────

export function paymentFailedHtml(businessName: string) {
  return shell(`
    ${badge(ICONS.card('#DC2626'), 'Pago fallido', '#DC2626')}
    ${heading(businessName)}
    <p style="color:${C.sub};font-size:14px;line-height:1.7;margin:0">
      No pudimos procesar el pago de tu suscripción Centinelia.<br><br>
      Tienes <strong style="color:${C.text}">3 días</strong> para actualizar tu método de pago antes de que el agente de voz sea pausado automáticamente.
    </p>
  `);
}

// ── Empresarial confirmation ──────────────────────────────────────────────────

export function empresarialConfirmationHtml(opts: {
  clientName:   string;
  businessName: string;
  contactEmail: string;
}) {
  return shell(`
    ${badge(ICONS.star, 'Solicitud recibida', '#D97706')}
    ${heading(`Hola, ${opts.clientName}`, opts.businessName)}
    <p style="color:${C.sub};font-size:14px;line-height:1.7;margin:0 0 16px">
      Recibimos tu solicitud para el plan Empresarial de Centinelia. Nuestro equipo revisará los requerimientos de <strong style="color:${C.text}">${opts.businessName}</strong> y te contactará en menos de 24 horas con una propuesta personalizada.
    </p>
    <p style="color:${C.sub};font-size:14px;line-height:1.7;margin:0 0 24px">
      Te escribiremos a este correo y también por WhatsApp al número que nos diste.
    </p>
    ${infoCard(`
      ${sectionLabel('Lo que sigue')}
      <p style="color:${C.sub};font-size:13px;line-height:1.8;margin:0">
        1. Revisión de tus necesidades de integración<br>
        2. Propuesta personalizada con precio final<br>
        3. Llamada de onboarding con el equipo de Centinelia
      </p>
    `, true)}
    ${btn('Responder este correo →', `mailto:${opts.contactEmail}`, false)}
  `);
}
