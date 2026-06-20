'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Power, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentActions({ agentId, active }: { agentId: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/agentes/${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      toast.success(active ? 'Agente desactivado' : 'Agente activado');
      setTimeout(() => { setDone(false); router.refresh(); }, 1200);
    } else {
      toast.error('Error al actualizar el agente');
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading || done}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
      style={{
        background: done ? 'rgba(34,197,94,0.12)' : active ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
        color: done ? '#22c55e' : active ? '#ef4444' : '#22c55e',
        border: `1px solid ${done ? '#22c55e33' : active ? '#ef444433' : '#22c55e33'}`,
        opacity: loading ? 0.5 : 1,
      }}
    >
      {done ? <Check size={13} /> : <Power size={13} />}
      {done ? 'Actualizado' : active ? 'Desactivar' : 'Activar'}
    </button>
  );
}
