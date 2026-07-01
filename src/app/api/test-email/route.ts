import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, weeklyReportHtml, newLeadHtml, welcomeHtml } from '@/lib/email/send';

// Temporary test endpoint — delete after verifying email templates
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const to      = searchParams.get('to') ?? 'nazre20@gmail.com';
  const type    = searchParams.get('type') ?? 'weekly';
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.centinelia.mx';
  const portal  = `${appUrl}/portal/test-token`;

  let html: string;
  let subject: string;

  if (type === 'lead') {
    subject = 'Nueva llamada — Restaurante El Fuego';
    html = newLeadHtml({
      businessName:  'Restaurante El Fuego',
      callerNumber:  '+528112345678',
      nombre:        'María García',
      servicio:      'Reservación para 6 personas el viernes',
      whatsapp:      '+528112345678',
      email:         'maria@ejemplo.com',
      summary:       'La cliente llamó para hacer una reservación para 6 personas el próximo viernes a las 8pm para una cena de cumpleaños. Se le confirmó disponibilidad y quedó agendada.',
      outcome:       'appointment_booked',
      portalUrl:     portal,
    });
  } else if (type === 'welcome') {
    subject = 'Bienvenido a Centinelia';
    html = welcomeHtml({
      clientName:  'Nazre',
      agentName:   'Sofia',
      businessName: 'Restaurante El Fuego',
      setupUrl:    portal,
    });
  } else {
    subject = 'Reporte semanal — Restaurante El Fuego';
    html = weeklyReportHtml({
      businessName:  'Restaurante El Fuego',
      portalUrl:     portal,
      period:        '24 jun – 1 jul',
      totalCalls:    47,
      leads:         12,
      appointments:  19,
      orders:        8,
      minutesUsed:   213,
      minutesTotal:  300,
      peakHour:      '7pm',
    });
  }

  const ok = await sendEmail({ to, subject, html });
  return NextResponse.json({ ok, type, to });
}
