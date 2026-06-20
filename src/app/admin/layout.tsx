import type { ReactNode } from 'react';
import Link from 'next/link';
import { Toaster } from 'sonner';
import AdminNav from './AdminNav';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: '#0a0f1e', color: '#e2e8f0' }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r flex flex-col" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#080d1a' }}>
        {/* Logo */}
        <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <Link href="/admin/dashboard" className="flex items-baseline gap-2">
            <span className="text-lg font-bold" style={{ color: '#00e5ff' }}>CentinelIA</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>admin</span>
          </Link>
        </div>

        <AdminNav />
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: { background: '#111827', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' },
        }}
      />
    </div>
  );
}
