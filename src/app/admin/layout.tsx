import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { cookies } from 'next/headers';
import AdminShell from './AdminShell';
import { ThemeProvider } from '@/components/ThemeProvider';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get('centinelia_admin')?.value === process.env.ADMIN_SECRET;

  if (!isAuth) {
    return (
      <ThemeProvider storageKey="centinelia-admin-theme" defaultTheme="dark">
        {children}
        <Toaster position="bottom-right" theme="dark" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider storageKey="centinelia-admin-theme" defaultTheme="dark">
      <AdminShell>{children}</AdminShell>
    </ThemeProvider>
  );
}
