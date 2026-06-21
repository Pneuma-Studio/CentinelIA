'use client';

import { useState, useMemo } from 'react';
import { Pencil, Trash2, Search, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import EditLeadModal from '../agentes/[id]/EditLeadModal';

export interface Lead {
  id: string;
  agent_id: string;
  nombre?: string;
  negocio?: string;
  giro?: string;
  servicio?: string;
  presupuesto?: string;
  timeline?: string;
  email?: string;
  whatsapp?: string;
  status?: string;
  created_at: string;
}

interface Props {
  leads: Lead[];
  agentMap: Record<string, string>;
}

const STATUSES = [
  { value: 'nuevo',      label: 'Nuevo',      color: '#9B6DFF' },
  { value: 'contactado', label: 'Contactado', color: '#3b82f6' },
  { value: 'cerrado',    label: 'Cerrado',    color: '#22c55e' },
  { value: 'perdido',    label: 'Perdido',    color: '#6b7280' },
];

function statusColor(s?: string) {
  return STATUSES.find(x => x.value === (s ?? 'nuevo'))?.color ?? '#6C3BFF';
}

export default function LeadsPipeline({ leads: initialLeads, agentMap }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [tab, setTab] = useState('todos');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const status = l.status ?? 'nuevo';
      if (tab !== 'todos' && status !== tab) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [l.nombre, l.negocio, l.servicio, l.whatsapp, l.email].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [leads, tab, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: leads.length };
    for (const l of leads) {
      const s = l.status ?? 'nuevo';
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [leads]);

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: lead.status } : l));
      toast.error('Error al actualizar estado');
    } else {
      toast.success('Estado actualizado');
    }
  };

  const handleDelete = async (lead: Lead) => {
    if (!confirm(`¿Eliminar lead de ${lead.nombre ?? 'este contacto'}?`)) return;
    setLeads(prev => prev.filter(l => l.id !== lead.id));
    const res = await fetch(`/api/admin/leads/${lead.id}`, { method: 'DELETE' });
    if (!res.ok) {
      setLeads(prev => [lead, ...prev]);
      toast.error('Error al eliminar');
    } else {
      toast.success('Lead eliminado');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaved = (updated: any) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
    setEditing(null);
    toast.success('Lead actualizado');
  };

  return (
    <>
      {/* Tabs + search */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--c-surface)' }}>
          <TabBtn value="todos" current={tab} count={counts.todos} onClick={setTab}>Todos</TabBtn>
          {STATUSES.map(s => (
            <TabBtn key={s.value} value={s.value} current={tab} count={counts[s.value] ?? 0} color={s.color} onClick={setTab}>
              {s.label}
            </TabBtn>
          ))}
        </div>

        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-text-3)' }} />
          <input
            type="text"
            placeholder="Buscar nombre, negocio, servicio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', color: 'var(--c-text)' }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center" style={{ color: 'var(--c-text-4)' }}>
          <p className="text-sm">Sin leads{tab !== 'todos' ? ` en estado "${STATUSES.find(s=>s.value===tab)?.label}"` : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              agentName={agentMap[lead.agent_id]}
              onStatusChange={handleStatusChange}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editing && (
        <EditLeadModal
          lead={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

function LeadCard({ lead, agentName, onStatusChange, onEdit, onDelete }: {
  lead: Lead;
  agentName?: string;
  onStatusChange: (lead: Lead, status: string) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}) {
  const status = lead.status ?? 'nuevo';
  const color = statusColor(status);

  return (
    <div className="group p-4 rounded-xl flex flex-col gap-3"
      style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm truncate" style={{ color: 'var(--c-text)' }}>{lead.nombre ?? 'Sin nombre'}</div>
          {agentName && (
            <Link href={`/admin/agentes/${lead.agent_id}`}
              className="text-xs hover:underline truncate block mt-0.5"
              style={{ color: 'var(--c-text-3)' }}>
              {agentName}
            </Link>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onEdit(lead)}
            className="p-1.5 rounded hover:bg-[var(--c-surface-2)] transition-colors"
            style={{ color: 'var(--c-text-2)' }}>
            <Pencil size={12} />
          </button>
          <button onClick={() => onDelete(lead)}
            className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
            style={{ color: 'var(--c-text-2)' }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Details */}
      {lead.negocio && (
        <div className="text-xs" style={{ color: 'var(--c-text-2)' }}>
          {lead.negocio}{lead.giro ? ` · ${lead.giro}` : ''}
        </div>
      )}
      {lead.servicio && (
        <div className="text-xs font-medium" style={{ color: '#9B6DFF' }}>{lead.servicio}</div>
      )}

      <div className="flex flex-wrap gap-2">
        {lead.presupuesto && <Chip>💰 {lead.presupuesto}</Chip>}
        {lead.timeline    && <Chip>📅 {lead.timeline}</Chip>}
      </div>

      <div className="flex flex-col gap-1">
        {lead.whatsapp && (
          <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs hover:underline"
            style={{ color: '#25D366' }}>
            <Phone size={11} /> {lead.whatsapp}
          </a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}`}
            className="flex items-center gap-1.5 text-xs hover:underline"
            style={{ color: 'var(--c-text-2)' }}>
            <Mail size={11} /> {lead.email}
          </a>
        )}
      </div>

      {/* Status selector */}
      <div className="flex gap-1 mt-auto pt-2" style={{ borderTop: '1px solid var(--c-divider)' }}>
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => onStatusChange(lead, s.value)}
            className="flex-1 py-1 rounded text-xs font-medium transition-all"
            style={{
              background: status === s.value ? `${s.color}22` : 'transparent',
              color: status === s.value ? s.color : 'var(--c-text-4)',
              border: `1px solid ${status === s.value ? s.color + '44' : 'transparent'}`,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="text-xs" style={{ color: 'var(--c-text-4)' }}>
        {new Date(lead.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}

function TabBtn({ value, current, count, color, children, onClick }: {
  value: string; current: string; count: number; color?: string; children: React.ReactNode; onClick: (v: string) => void;
}) {
  const active = value === current;
  const c = color ?? 'var(--c-text)';
  return (
    <button
      onClick={() => onClick(value)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
      style={{
        background: active ? (color ? `${color}18` : 'var(--c-surface-2)') : 'transparent',
        color: active ? (color ?? 'var(--c-text)') : 'var(--c-text-2)',
      }}
    >
      {children}
      <span className="text-xs rounded-full px-1.5 py-0.5"
        style={{ background: 'var(--c-surface-2)', color: active ? c : 'var(--c-text-3)' }}>
        {count ?? 0}
      </span>
    </button>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--c-surface-2)', color: 'var(--c-text-2)' }}>
      {children}
    </span>
  );
}
