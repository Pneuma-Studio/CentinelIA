'use client';

const ITEMS = [
  '🎙️ Recepcionista 24/7',
  '📅 Agenda de citas',
  '👤 Captura de leads',
  '📦 Toma de pedidos',
  '💬 Resúmenes por WhatsApp',
  '📊 Portal de reportes',
  '🔀 Transferencia inteligente',
  '🌐 Multiidioma ES + EN',
  '🧠 Inteligencia Artificial',
  '⚡ Activo en 24 horas',
];

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="marquee-track" aria-hidden>
      <div className="marquee-inner">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">{item}</span>
        ))}
      </div>
    </div>
  );
}
