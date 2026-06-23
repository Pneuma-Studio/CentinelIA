'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Toaster } from 'sonner';
import AdminNav from './AdminNav';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 flex-shrink-0 flex flex-col border-r transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#1A0A3B' }}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <Link href="/admin/dashboard" className="flex items-baseline gap-2">
            <span className="text-lg font-bold" style={{ color: '#9B6DFF' }}>CentinelIA</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>admin</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-1.5 rounded-lg transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <AdminNav />
        <div className="px-5 py-4 mt-auto border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Powered by{' '}
            <a
              href="https://pneumastudio.mx"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00f5ff' }}
              className="hover:opacity-80 transition-opacity"
            >
              Pneuma Studio
            </a>
          </p>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30 border-b"
          style={{ background: '#1A0A3B', borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <Menu size={20} />
          </button>
          <Link href="/admin/dashboard" className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold" style={{ color: '#9B6DFF' }}>CentinelIA</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>admin</span>
          </Link>
        </div>

        <main className="flex-1 overflow-auto" style={{ background: 'var(--c-bg)' }}>
          {children}
        </main>
      </div>

      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: { background: '#1e0d45', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' },
        }}
      />
    </div>
  );
}
