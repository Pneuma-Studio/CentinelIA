const TWILIO_SID   = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_WA    = process.env.TWILIO_WHATSAPP_FROM!; // whatsapp:+14155238886 (sandbox) or your number

function toWaNumber(num: string) {
  const clean = num.replace(/\s/g, '');
  return clean.startsWith('whatsapp:') ? clean : `whatsapp:${clean}`;
}

export async function sendWhatsApp(to: string, body: string, fromNumber?: string): Promise<boolean> {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_WA) {
    console.warn('WhatsApp not configured — missing TWILIO_* env vars');
    return false;
  }

  const from = fromNumber ? toWaNumber(fromNumber) : TWILIO_WA;
  const toWa = toWaNumber(to);

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: from, To: toWa, Body: body }).toString(),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('WhatsApp send error:', err);
    return false;
  }
  return true;
}
