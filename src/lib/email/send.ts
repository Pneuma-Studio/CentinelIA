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

export function welcomeHtml(opts: { businessName: string; setupUrl: string }) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0D0621;padding:24px;margin:0">
    <div style="max-width:520px;margin:0 auto">
      <div style="text-align:center;padding:32px 0 24px">
        <div style="display:inline-flex;width:52px;height:52px;border-radius:16px;background:rgba(108,59,255,0.25);border:1px solid rgba(108,59,255,0.4);align-items:center;justify-content:center;font-size:22px;margin-bottom:16px">⚡</div>
        <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px">¡Tu agente de voz está listo!</h1>
        <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0">Bienvenido a CentinelIA · ${opts.businessName}</p>
      </div>

      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;margin-bottom:20px">
        <p style="color:rgba(255,255,255,0.8);font-size:14px;line-height:1.7;margin:0 0 20px">
          Tu pago fue procesado exitosamente. En las próximas horas asignaremos tu número de teléfono dedicado y te avisaremos por WhatsApp cuando tu agente esté en línea.
        </p>
        <p style="color:rgba(255,255,255,0.8);font-size:14px;line-height:1.7;margin:0 0 24px">
          Mientras tanto, configura tu acceso al portal del cliente para monitorear tus llamadas, leads y minutos:
        </p>
        <div style="text-align:center">
          <a href="${opts.setupUrl}"
            style="display:inline-block;background:linear-gradient(135deg,#6C3BFF,#9B6DFF);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:12px">
            Acceder a mi portal →
          </a>
        </div>
      </div>

      <div style="background:rgba(108,59,255,0.08);border:1px solid rgba(108,59,255,0.2);border-radius:12px;padding:16px 20px">
        <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 8px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase">¿Qué sigue?</p>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.6;margin:0">
          1. Configura tu contraseña en el portal<br>
          2. Recibe tu número de teléfono (próximas horas)<br>
          3. Comparte el número con tus clientes y empieza a recibir llamadas 24/7
        </p>
      </div>

      <div style="text-align:center;padding:24px 0 0">
        <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0">
          CentinelIA · Pneuma Studio<br>
          <a href="mailto:hola@centinelia.mx" style="color:rgba(108,59,255,0.7);text-decoration:none">hola@centinelia.mx</a>
        </p>
      </div>
    </div>
  </body></html>`;
}

export function paymentFailedHtml(businessName: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;padding:24px">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
      <div style="color:#ef4444;font-size:18px;font-weight:700;margin-bottom:16px">💳 Pago fallido — ${businessName}</div>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0">
        No pudimos procesar el pago de tu suscripción CentinelIA.<br><br>
        Tienes <strong>3 días</strong> para actualizar tu método de pago antes de que el agente de voz sea pausado automáticamente.<br><br>
        Actualiza tu método de pago en el portal del cliente o contáctanos para regularizar tu cuenta.
      </p>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f3f4f6;color:#9ca3af;font-size:12px">
        CentinelIA · Pneuma Studio
      </div>
    </div>
  </body></html>`;
}
