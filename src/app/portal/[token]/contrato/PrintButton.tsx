'use client';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
      style={{ background: '#6C3BFF', color: '#fff' }}
    >
      <Printer size={14} />
      Imprimir / Descargar PDF
    </button>
  );
}
