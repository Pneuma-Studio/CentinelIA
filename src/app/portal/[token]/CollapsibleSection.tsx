'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
  count,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 rounded-xl transition-colors"
        style={{ color: 'var(--c-text-3)' }}
      >
        <h2 className="text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5">
          {icon}{title}
          {count !== undefined && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-medium"
              style={{ background: 'var(--c-surface-2)', color: 'var(--c-text-2)' }}>
              {count}
            </span>
          )}
        </h2>
        <ChevronDown
          size={14}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}
