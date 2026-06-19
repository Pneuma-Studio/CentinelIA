'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Power } from 'lucide-react';

export default function AgentActions({ agentId, active }: { agentId: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    await fetch(`/api/admin/agentes/${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity"
      style={{
        background: active ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
        color: active ? '#ef4444' : '#22c55e',
        border: `1px solid ${active ? '#ef444433' : '#22c55e33'}`,
        opacity: loading ? 0.5 : 1,
      }}
    >
      <Power size={13} />
      {active ? 'Desactivar' : 'Activar'}
    </button>
  );
}
