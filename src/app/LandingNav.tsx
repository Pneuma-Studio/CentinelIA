'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Menu, X } from 'lucide-react';

const INDUSTRIES = [
  { href: '/industrias/clinicas',     label: 'Clínicas y Consultorios' },
  { href: '/industrias/restaurantes', label: 'Restaurantes y Cafeterías' },
  { href: '/industrias/despachos',    label: 'Despachos y Consultorías' },
  { href: '/industrias/inmobiliarias',label: 'Inmobiliarias' },
  { href: '/industrias/tiendas',      label: 'Tiendas y Servicios' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const textColor = scrolled ? 'rgba(26,10,59,0.58)' : 'rgba(255,255,255,0.72)';

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background:     scrolled ? 'rgba(250,251,255,0.93)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom:   scrolled ? '1px solid rgba(108,59,255,0.1)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          {scrolled ? (
            <Image src="/logo.png" alt="Centinelia" height={44} width={200}
              style={{ height: 44, width: 'auto', objectFit: 'contain' }} priority />
          ) : (
            <Image src="/logo-icon.png" alt="Centinelia" width={52} height={52}
              style={{ width: 52, height: 52, objectFit: 'contain' }} priority />
          )}
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* Desktop: Industrias dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setOpen(v => !v)}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ color: textColor }}
            >
              Industrias
              <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </button>

            {open && (
              <div
                className="absolute right-0 top-full mt-2 w-60 rounded-2xl shadow-xl overflow-hidden"
                style={{ background: '#fff', border: '1px solid rgba(108,59,255,0.12)' }}
              >
                {INDUSTRIES.map(ind => (
                  <Link
                    key={ind.href}
                    href={ind.href}
                    onClick={() => setOpen(false)}
                    className="block px-5 py-2.5 text-sm hover:bg-[#FAFBFF] transition-colors"
                    style={{ color: '#1A0A3B' }}
                  >
                    {ind.label}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid rgba(108,59,255,0.1)', margin: '4px 0' }} />
                <Link
                  href="/portal/login"
                  onClick={() => setOpen(false)}
                  className="block px-5 py-2.5 pb-3 text-sm hover:bg-[#FAFBFF] transition-colors"
                  style={{ color: 'rgba(26,10,59,0.5)' }}
                >
                  Iniciar sesión
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setOpen(v => !v)}
            className="sm:hidden p-2 rounded-xl transition-colors"
            style={{ color: textColor }}
            aria-label="Menú"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Contratar — always visible */}
          <Link
            href="/registro"
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#6C3BFF', color: '#fff' }}
          >
            Contratar
          </Link>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {open && (
        <div
          className="sm:hidden"
          style={{ background: '#fff', borderBottom: '1px solid rgba(108,59,255,0.1)' }}
        >
          <p className="px-5 pt-4 pb-1 text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(26,10,59,0.32)' }}>
            Industrias
          </p>
          {INDUSTRIES.map(ind => (
            <Link
              key={ind.href}
              href={ind.href}
              onClick={() => setOpen(false)}
              className="block px-5 py-3 text-sm"
              style={{ color: '#1A0A3B' }}
            >
              {ind.label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid rgba(108,59,255,0.1)', margin: '4px 20px' }} />
          <Link
            href="/portal/login"
            onClick={() => setOpen(false)}
            className="block px-5 py-3 pb-4 text-sm"
            style={{ color: 'rgba(26,10,59,0.5)' }}
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </nav>
  );
}
