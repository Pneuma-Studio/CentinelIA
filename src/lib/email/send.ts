const FROM    = process.env.RESEND_FROM_EMAIL ?? 'Centinelia <notificaciones@centinelia.mx>';
const LOGO    = 'https://centinelia.mx/logo-icon.png';
const FOOTER  = `
  <div style="text-align:center;padding:24px 0 8px;border-top:1px solid rgba(255,255,255,0.06)">
    <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;line-height:1.8">
      Centinelia · Pneuma Studio<br>
      <a href="mailto:hola@centinelia.mx" style="color:rgba(108,59,255,0.6);text-decoration:none">hola@centinelia.mx</a>
    </p>
  </div>`;

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('Email not configured — missing RESEND_API_KEY');
    return false;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html }),
  });

  if (!res.ok) {
    console.error('Email send error:', await res.text());
    return false;
  }
  return true;
}

export function minutesAlertHtml(opts: {
  businessName: string;
  pct: number;
  used: number;
  included: number;
  resetDate: string;
}) {
  const isPaused = opts.pct >= 100;
  const accentColor = isPaused ? '#ef4444' : '#f59e0b';
  const badge = isPaused ? '⚠️ Agente pausado' : `📊 ${Math.round(opts.pct)}% de minutos usados`;
  const bodyText = isPaused
    ? `Tu agente de voz <strong style="color:#fff">${opts.businessName}</strong> ha sido <strong style="color:#ef4444">pausado automáticamente</strong> al agotar los ${opts.included} minutos de tu plan.<br><br>Contacta a tu asesor de Centinelia para reactivar el servicio o adquirir minutos adicionales.`
    : `Tu agente de voz <strong style="color:#fff">${opts.businessName}</strong> ha usado <strong style="color:#f59e0b">${opts.used} de ${opts.included} minutos</strong> (${Math.round(opts.pct)}%).<br><br>Si necesitas ampliar tu plan, contacta a tu asesor antes de que el agente se pause automáticamente.<br><br>Reinicio del contador: <strong style="color:#fff">${opts.resetDate}</strong>.`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#0D0621;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto">
    <div style="text-align:center;padding:32px 0 24px">
      <img src="${LOGO}" alt="Centinelia" width="64" height="64" style="width:64px;height:64px;border-radius:16px;display:inline-block" />
    </div>
    <div style="text-align:center;margin-bottom:24px">
      <span style="display:inline-block;background:rgba(108,59,255,0.2);border:1px solid ${accentColor}55;border-radius:20px;padding:5px 16px;color:${accentColor};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px">${badge}</span>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:20px">
      <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;margin:0">${bodyText}</p>
    </div>
    ${FOOTER}
  </div>
</body>
</html>`;
}

export function welcomeHtml(opts: { businessName: string; setupUrl: string }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#0D0621;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto">
    <div style="text-align:center;padding:32px 0 24px">
      <img src="${LOGO}" alt="Centinelia" width="64" height="64" style="width:64px;height:64px;border-radius:16px;display:inline-block" />
    </div>
    <div style="text-align:center;margin-bottom:24px">
      <span style="display:inline-block;background:rgba(108,59,255,0.2);border:1px solid rgba(108,59,255,0.45);border-radius:20px;padding:5px 16px;color:#C4A8FF;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px">🎉 ¡Bienvenido a Centinelia!</span>
      <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 6px">Tu agente de voz está listo</h1>
      <p style="color:rgba(255,255,255,0.38);font-size:13px;margin:0">${opts.businessName}</p>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;margin-bottom:20px">
      <p style="color:rgba(255,255,255,0.8);font-size:14px;line-height:1.7;margin:0 0 20px">
        Tu pago fue procesado exitosamente. En las próximas horas asignaremos tu número de teléfono dedicado y te avisaremos por WhatsApp cuando tu agente esté en línea.
      </p>
      <p style="color:rgba(255,255,255,0.8);font-size:14px;line-height:1.7;margin:0 0 24px">
        Mientras tanto, configura tu acceso al portal para monitorear tus llamadas, leads y minutos:
      </p>
      <div style="text-align:center">
        <a href="${opts.setupUrl}" style="display:inline-block;background:linear-gradient(135deg,#6C3BFF,#9B6DFF);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:12px">
          Acceder a mi portal →
        </a>
      </div>
    </div>
    <div style="background:rgba(108,59,255,0.08);border:1px solid rgba(108,59,255,0.2);border-radius:12px;padding:16px 20px;margin-bottom:20px">
      <p style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px">¿Qué sigue?</p>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;margin:0">
        1. Configura tu contraseña en el portal<br>
        2. Recibe tu número de teléfono (próximas horas)<br>
        3. Comparte el número con tus clientes y empieza a recibir llamadas 24/7
      </p>
    </div>
    ${FOOTER}
  </div>
</body>
</html>`;
}

export function weeklyReportHtml(opts: {
  businessName: string;
  portalUrl:    string;
  period:       string; // e.g. "16 – 22 jun"
  totalCalls:   number;
  leads:        number;
  appointments: number;
  orders:       number;
  minutesUsed:  number;
  minutesTotal: number;
  peakHour:     string | null; // e.g. "3pm"
}) {
  const pct = opts.minutesTotal > 0 ? Math.round((opts.minutesUsed / opts.minutesTotal) * 100) : 0;
  const barColor = pct >= 80 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#6C3BFF';

  function statRow(emoji: string, label: string, value: number, color: string) {
    if (value === 0) return '';
    return `<tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.38);font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;width:140px">${emoji} ${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:${color};font-size:22px;font-weight:700;text-align:right">${value}</td>
    </tr>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#0D0621;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto">

    <div style="text-align:center;padding:32px 0 24px">
      <img src="${LOGO}" alt="Centinelia" width="64" height="64" style="width:64px;height:64px;border-radius:16px;display:inline-block" />
    </div>

    <div style="text-align:center;margin-bottom:24px">
      <span style="display:inline-block;background:rgba(108,59,255,0.2);border:1px solid rgba(108,59,255,0.45);border-radius:20px;padding:5px 16px;color:#C4A8FF;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px">
        📊 Reporte semanal
      </span>
      <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 6px">${opts.businessName}</h1>
      <p style="color:rgba(255,255,255,0.38);font-size:13px;margin:0">${opts.period}</p>
    </div>

    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:8px 20px 0;margin-bottom:20px">
      <table style="width:100%;border-collapse:collapse">
        ${statRow('📞', 'Llamadas', opts.totalCalls, '#e2e8f0')}
        ${statRow('🎯', 'Leads', opts.leads, '#9B6DFF')}
        ${statRow('📅', 'Citas', opts.appointments, '#3b82f6')}
        ${statRow('🛒', 'Pedidos', opts.orders, '#f59e0b')}
      </table>
    </div>

    <div style="background:rgba(108,59,255,0.08);border:1px solid rgba(108,59,255,0.2);border-radius:12px;padding:16px 20px;margin-bottom:20px">
      <p style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 10px">Minutos del plan</p>
      <div style="background:rgba(255,255,255,0.08);border-radius:6px;height:8px;overflow:hidden;margin-bottom:8px">
        <div style="height:100%;width:${Math.min(pct, 100)}%;background:${barColor};border-radius:6px;transition:width 0.3s"></div>
      </div>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0">${opts.minutesUsed} de ${opts.minutesTotal} min usados <span style="color:rgba(255,255,255,0.3)">(${pct}%)</span></p>
      ${opts.peakHour ? `<p style="color:rgba(255,255,255,0.38);font-size:12px;margin:8px 0 0">⏰ Hora pico: <span style="color:rgba(255,255,255,0.6);font-weight:600">${opts.peakHour}</span></p>` : ''}
    </div>

    <div style="text-align:center;margin-bottom:28px">
      <a href="${opts.portalUrl}" style="display:inline-block;background:linear-gradient(135deg,#6C3BFF,#9B6DFF);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:12px">
        Ver portal completo →
      </a>
    </div>

    ${FOOTER}

  </div>
</body>
</html>`;
}

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
  const outcomeLabels: Record<string, string> = {
    lead_created:       '🎯 Nuevo lead',
    appointment_booked: '📅 Cita agendada',
    order_taken:        '🛒 Pedido tomado',
    transferred:        '📞 Llamada transferida',
    info_provided:      'ℹ️ Consulta atendida',
    other:              '📱 Llamada completada',
  };
  const outcomeLabel = outcomeLabels[opts.outcome] ?? '📱 Llamada';

  function row(label: string, value: string | null | undefined) {
    if (!value?.trim()) return '';
    return `<tr>
      <td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.38);font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;width:130px;vertical-align:top">${label}</td>
      <td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#e2e8f0;font-size:14px;font-weight:500">${value}</td>
    </tr>`;
  }

  const rows = [
    row('Teléfono',    opts.callerNumber),
    row('Nombre',      opts.nombre),
    row('Interés',     opts.servicio),
    row('WhatsApp',    opts.whatsapp && opts.whatsapp !== opts.callerNumber ? opts.whatsapp : null),
    row('Email',       opts.email),
  ].join('');

  const summarySection = opts.summary
    ? `<div style="background:rgba(108,59,255,0.08);border:1px solid rgba(108,59,255,0.2);border-radius:12px;padding:16px 20px;margin-bottom:20px">
        <p style="color:rgba(255,255,255,0.38);font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px">Resumen de la llamada</p>
        <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.65;margin:0">${opts.summary}</p>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#0D0621;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto">

    <div style="text-align:center;padding:32px 0 24px">
      <img src="${LOGO}" alt="Centinelia" width="64" height="64" style="width:64px;height:64px;border-radius:16px;display:inline-block" />
    </div>

    <div style="text-align:center;margin-bottom:24px">
      <span style="display:inline-block;background:rgba(108,59,255,0.2);border:1px solid rgba(108,59,255,0.45);border-radius:20px;padding:5px 16px;color:#C4A8FF;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px">
        ${outcomeLabel}
      </span>
      <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 6px;line-height:1.2">
        ${opts.businessName}
      </h1>
      <p style="color:rgba(255,255,255,0.38);font-size:13px;margin:0">Tu agente de voz capturó nueva actividad</p>
    </div>

    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:8px 20px 0;margin-bottom:20px">
      <table style="width:100%;border-collapse:collapse">${rows}</table>
    </div>

    ${summarySection}

    <div style="text-align:center;margin-bottom:28px">
      <a href="${opts.portalUrl}"
        style="display:inline-block;background:linear-gradient(135deg,#6C3BFF,#9B6DFF);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:0.01em">
        Ver en mi portal →
      </a>
    </div>

    ${FOOTER}

  </div>
</body>
</html>`;
}

export function paymentFailedHtml(businessName: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#0D0621;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto">
    <div style="text-align:center;padding:32px 0 24px">
      <img src="${LOGO}" alt="Centinelia" width="64" height="64" style="width:64px;height:64px;border-radius:16px;display:inline-block" />
    </div>
    <div style="text-align:center;margin-bottom:24px">
      <span style="display:inline-block;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);border-radius:20px;padding:5px 16px;color:#f87171;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px">💳 Pago fallido</span>
      <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 6px">${businessName}</h1>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:20px">
      <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;margin:0">
        No pudimos procesar el pago de tu suscripción Centinelia.<br><br>
        Tienes <strong style="color:#fff">3 días</strong> para actualizar tu método de pago antes de que el agente de voz sea pausado automáticamente.<br><br>
        Actualiza tu método de pago en el portal del cliente o contáctanos para regularizar tu cuenta.
      </p>
    </div>
    ${FOOTER}
  </div>
</body>
</html>`;
}
