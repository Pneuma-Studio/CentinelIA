import type { ReactNode } from 'react';
import Link from 'next/link';
import { Toaster } from 'sonner';
import { cookies } from 'next/headers';
import AdminNav from './AdminNav';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';

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
      <div className="min-h-screen flex" style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}>
        {/* Sidebar — always dark */}
        <aside className="w-60 flex-shrink-0 border-r flex flex-col" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#1A0A3B' }}>
          <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <Link href="/admin/dashboard" className="flex items-baseline gap-2">
              <span className="text-lg font-bold" style={{ color: '#9B6DFF' }}>CentinelIA</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>admin</span>
            </Link>
            <ThemeToggle />
          </div>
          <AdminNav />
        </aside>

        <main className="flex-1 overflow-auto" style={{ background: 'var(--c-bg)' }}>
          {children}
        </main>

        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: { background: '#1e0d45', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' },
          }}
        />
      </div>
    </ThemeProvider>
  );
}
