import { NextRequest } from 'next/server';
import { verifySession, PORTAL_COOKIE } from '@/lib/portal/auth';

const ADMIN_COOKIE = 'Centinelia_admin';

/** Returns true if the request carries a valid admin or portal session cookie. */
export async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const adminCookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (adminCookie && adminCookie === process.env.ADMIN_SECRET) return true;

  const portalCookie = req.cookies.get(PORTAL_COOKIE)?.value ?? '';
  if (portalCookie) {
    const session = await verifySession(portalCookie);
    if (session) return true;
  }

  return false;
}
