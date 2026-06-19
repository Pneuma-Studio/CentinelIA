'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import EditLeadModal from './EditLeadModal';

interface Lead {
  id: string;
  nombre?: string;
  negocio?: string;
  giro?: string;
  servicio?: string;
  presupuesto?: string;
  timeline?: string;
  email?: string;
  whatsapp?: string;
  created_at: string;
}

export default function LeadsSection({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [editing, setEditing] = useState<Lead | null>(null);

  const handleSaved = (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este lead?')) return;
    const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
    if (res.ok) setLeads(prev => prev.filter(l => l.id !== id));
  };

  return (
    <>
      <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 className="text-xs font-semibold mb-4 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Leads recientes ({leads.length})
        </h2>
        {leads.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Sin leads registrados</p>
        ) : (
          <div className="flex flex-col gap-2">
            {leads.map(lead => (
              <div key={lead.id} className="px-3 py-2.5 rounded-lg group"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium">{lead.nombre ?? 'Sin nombre'}</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {new Date(lead.created_at).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    {lead.negocio && (
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {lead.negocio}{lead.giro ? ` · ${lead.giro}` : ''}
                      </div>
                    )}
                    {lead.servicio && (
                      <div className="text-xs mt-0.5" style={{ color: '#00e5ff' }}>{lead.servicio}</div>
                    )}
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {lead.presupuesto && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>💰 {lead.presupuesto}</span>}
                      {lead.timeline    && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>📅 {lead.timeline}</span>}
                      {lead.whatsapp    && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>📱 {lead.whatsapp}</span>}
                      {lead.email       && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>📧 {lead.email}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => setEditing(lead)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(lead.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
