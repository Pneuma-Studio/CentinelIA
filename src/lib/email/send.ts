const FROM = process.env.RESEND_FROM_EMAIL ?? 'CentinelIA <notificaciones@centinelia.mx>';

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
  const color = opts.pct >= 100 ? '#ef4444' : '#f59e0b';
  const title = opts.pct >= 100
    ? `⚠️ Agente pausado — minutos agotados`
    : `📊 Aviso: ${Math.round(opts.pct)}% de minutos usados`;
  const body = opts.pct >= 100
    ? `Tu agente de voz <strong>${opts.businessName}</strong> ha sido <strong>pausado automáticamente</strong> al agotar los ${opts.included} minutos de tu plan.<br><br>Contacta a tu asesor de CentinelIA para reactivar el servicio o adquirir minutos adicionales.`
    : `Tu agente de voz <strong>${opts.businessName}</strong> ha usado <strong>${opts.used} de ${opts.included} minutos</strong> (${Math.round(opts.pct)}%).<br><br>Si necesitas ampliar tu plan, contacta a tu asesor antes de que el agente se pause automáticamente.<br><br>Reinicio del contador: <strong>${opts.resetDate}</strong>.`;

  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;padding:24px">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
      <div style="color:${color};font-size:18px;font-weight:700;margin-bottom:16px">${title}</div>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0">${body}</p>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f3f4f6;color:#9ca3af;font-size:12px">
        CentinelIA · Pneuma Studio
      </div>
    </div>
  </body></html>`;
}

export function paymentFailedHtml(businessName: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;padding:24px">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
      <div style="color:#ef4444;font-size:18px;font-weight:700;margin-bottom:16px">💳 Pago fallido — ${businessName}</div>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0">
        No pudimos procesar el pago de tu suscripción CentinelIA. Tu agente de voz ha sido pausado.<br><br>
        Actualiza tu método de pago para reactivar el servicio.
      </p>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f3f4f6;color:#9ca3af;font-size:12px">
        CentinelIA · Pneuma Studio
      </div>
    </div>
  </body></html>`;
}
