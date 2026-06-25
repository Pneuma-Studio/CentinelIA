import { NextRequest, NextResponse } from 'next/server';
import {
  welcomeHtml,
  newLeadHtml,
  weeklyReportHtml,
  minutesAlertHtml,
  paymentFailedHtml,
} from '@/lib/email/send';

const templates: Record<string, string> = {
  welcome: welcomeHtml({
    businessName: 'Restaurante El Portón',
    setupUrl: 'https://centinelia.mx/portal/demo-token/configurar',
  }),
  lead: newLeadHtml({
    businessName:  'Restaurante El Portón',
    callerNumber:  '+52 81 1234 5678',
    nombre:        'Carlos Mendoza',
    servicio:      'Reservación para 4 personas el sábado',
    whatsapp:      '+52 81 1234 5678',
    email:         'carlos@email.com',
    summary:       'El cliente llamó para hacer una reservación para 4 personas el sábado a las 8pm. Confirmó que vendrán 2 adultos y 2 niños. Dejó su WhatsApp para confirmación.',
    outcome:       'appointment_booked',
    portalUrl:     'https://centinelia.mx/portal/demo-token',
  }),
  weekly: weeklyReportHtml({
    businessName: 'Restaurante El Portón',
    portalUrl:    'https://centinelia.mx/portal/demo-token',
    period:       '16 – 22 jun',
    totalCalls:   47,
    leads:        12,
    appointments: 8,
    orders:       5,
    minutesUsed:  183,
    minutesTotal: 200,
    peakHour:     '8pm',
  }),
  minutes_warning: minutesAlertHtml({
    businessName: 'Restaurante El Portón',
    pct:          83,
    used:         166,
    included:     200,
    resetDate:    '1 de julio',
  }),
  minutes_paused: minutesAlertHtml({
    businessName: 'Restaurante El Portón',
    pct:          100,
    used:         200,
    included:     200,
    resetDate:    '1 de julio',
  }),
  payment_failed: paymentFailedHtml('Restaurante El Portón'),
};

const nav = Object.keys(templates).map(k =>
  `<a href="?t=${k}" style="display:inline-block;margin:4px;padding:6px 14px;background:#1e1040;border:1px solid rgba(108,59,255,0.4);border-radius:8px;color:#C4A8FF;font-size:13px;text-decoration:none;font-family:monospace">${k}</a>`
).join('');

export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get('t') ?? 'welcome';
  const html = templates[t];
  if (!html) return NextResponse.json({ error: 'unknown template' }, { status: 404 });

  return new Response(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;background:#060414;padding:16px}nav{max-width:600px;margin:0 auto 20px;padding:12px;background:#0D0621;border-radius:10px}h3{color:rgba(255,255,255,0.3);font-size:11px;font-family:monospace;margin:0 0 8px;text-transform:uppercase;letter-spacing:.1em}iframe{width:100%;max-width:600px;display:block;margin:0 auto;border:1px solid rgba(255,255,255,0.08);border-radius:12px;height:90vh}</style></head><body><nav><h3>Email Preview</h3>${nav}</nav><iframe srcdoc="${html.replace(/"/g, '&quot;')}"></iframe></body></html>`, {
    headers: { 'Content-Type': 'text/html' },
  });
}
