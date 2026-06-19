import type { ReactNode } from 'react';
import Link from 'next/link';
import { LayoutDashboard, PhoneCall, Settings, BarChart3, Plus } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: '#0a0f1e', color: '#e2e8f0' }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r flex flex-col" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#080d1a' }}>
        {/* Logo */}
        <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <span className="text-lg font-bold" style={{ color: '#00e5ff' }}>CentinelIA</span>
          <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <NavLink href="/admin/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <NavLink href="/admin/agentes" icon={<Settings size={16} />} label="Agentes" />
          <NavLink href="/admin/llamadas" icon={<PhoneCall size={16} />} label="Llamadas" />
          <NavLink href="/admin/analytics" icon={<BarChart3 size={16} />} label="Analytics" />
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <Link
              href="/admin/agentes/nuevo"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ background: '#00e5ff', color: '#080d1a' }}
            >
              <Plus size={14} />
              Nuevo agente
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:text-white"
      style={{ color: 'rgba(255,255,255,0.55)' }}
    >
      {icon}
      {label}
    </Link>
  );
}
