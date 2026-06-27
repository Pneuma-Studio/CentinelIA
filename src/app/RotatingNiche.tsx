'use client';

import { useState, useEffect } from 'react';

const NICHES = [
  'captura leads',
  'agenda citas',
  'toma pedidos',
];

export default function RotatingNiche() {
  const [idx,     setIdx]     = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(n => (n + 1) % NICHES.length);
        setVisible(true);
      }, 300);
    }, 2600);
    return () => clearInterval(cycle);
  }, []);

  return (
    <span
      style={{
        display:    'inline-block',
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(-6px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        color:      '#C4A8FF',
        fontWeight: 600,
      }}
    >
      {NICHES[idx]}
    </span>
  );
}
