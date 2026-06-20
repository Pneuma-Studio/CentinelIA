'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PhoneCall, Settings, BarChart3, Users, Plus } from 'lucide-react';

const links = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/agentes',   icon: Settings,         label: 'Agentes' },
  { href: '/admin/llamadas',  icon: PhoneCall,        label: 'Llamadas' },
  { href: '/admin/leads',     icon: Users,            label: 'Leads' },
  { href: '/admin/analytics', icon: BarChart3,        label: 'Analytics' },
];

export default function AdminNav() {
  const path = usePathname();

  return (
    <nav className="flex-1 p-4 flex flex-col gap-0.5">
      {links.map(({ href, icon: Icon, label }) => {
        const active = path === href || path.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
            style={{
              color: active ? '#00e5ff' : 'rgba(255,255,255,0.45)',
              background: active ? 'rgba(0,229,255,0.08)' : 'transparent',
              fontWeight: active ? 600 : 400,
            }}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}

      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <Link
          href="/admin/agentes/nuevo"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ background: '#00e5ff', color: '#080d1a' }}
        >
          <Plus size={14} />
          Nuevo agente
        </Link>
      </div>
    </nav>
  );
}
