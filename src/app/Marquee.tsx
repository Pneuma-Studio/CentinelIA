'use client';

import {
  Phone, CalendarDays, Users, ShoppingBag,
  MessageCircle, BarChart3, ArrowLeftRight,
  Globe, Cpu, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ITEMS: { icon: LucideIcon; label: string }[] = [
  { icon: Phone,            label: 'Recepcionista 24/7' },
  { icon: CalendarDays,     label: 'Agenda de citas' },
  { icon: Users,            label: 'Captura de leads' },
  { icon: ShoppingBag,      label: 'Toma de pedidos' },
  { icon: MessageCircle,    label: 'Resúmenes por WhatsApp' },
  { icon: BarChart3,        label: 'Portal de reportes' },
  { icon: ArrowLeftRight,   label: 'Transferencia inteligente' },
  { icon: Globe,            label: 'Multiidioma ES + EN' },
  { icon: Cpu,              label: 'Inteligencia Artificial' },
  { icon: Zap,              label: 'Activo en 24 horas' },
];

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="marquee-track" aria-hidden>
      <div className="marquee-inner">
        {doubled.map((item, i) => {
          const Icon = item.icon;
          return (
            <span key={i} className="marquee-item">
              <Icon size={13} color="#6C3BFF" strokeWidth={2} style={{ flexShrink: 0 }} />
              {item.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
