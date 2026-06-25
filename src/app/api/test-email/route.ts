import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/send';

export async function GET() {
  const ok = await sendEmail({
    to: 'nazre20@gmail.com',
    subject: '✅ Email de prueba — CentinelIA',
    html: `<!DOCTYPE html><html><body style="font-family:Arial,Helvetica,sans-serif;background:#0D0621;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto">
    <div style="text-align:center;padding:32px 0 24px">
      <img src="https://centinelia.mx/logo.png" alt="Centinelia" height="38" style="height:38px;width:auto;display:inline-block;border-radius:6px" />
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;text-align:center">
      <div style="font-size:32px;margin-bottom:16px">⚡</div>
      <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 12px">Email de prueba</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;margin:0">
        Si estás leyendo esto, los correos de CentinelIA llegan correctamente desde
        <strong style="color:#9B6DFF">notificaciones@centinelia.mx</strong>
      </p>
    </div>
    <div style="text-align:center;padding:24px 0 0">
      <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0">CentinelIA · Pneuma Studio<br>
      <a href="mailto:hola@centinelia.mx" style="color:rgba(108,59,255,0.6);text-decoration:none">hola@centinelia.mx</a></p>
    </div>
  </div>
</body></html>`,
  });
  return NextResponse.json({ ok });
}
