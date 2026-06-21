'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function PortalLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/portal/auth/logout', { method: 'POST' });
    router.push('/portal/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-opacity hover:opacity-80"
      style={{ color: 'rgba(255,255,255,0.3)' }}
      title="Cerrar sesión"
    >
      <LogOut size={13} />
      <span className="hidden sm:inline">Salir</span>
    </button>
  );
}
