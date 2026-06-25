'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
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
            <Image
              src="/logo.png"
              alt="Centinelia"
              height={44}
              width={200}
              style={{ height: 44, width: 'auto', objectFit: 'contain' }}
              priority
            />
          ) : (
            <Image
              src="/logo-icon.png"
              alt="Centinelia"
              width={52}
              height={52}
              style={{ width: 52, height: 52, objectFit: 'contain' }}
              priority
            />
          )}
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/portal/login"
            className="hidden sm:block px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ color: scrolled ? 'rgba(26,10,59,0.5)' : 'rgba(255,255,255,0.65)' }}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#6C3BFF', color: '#fff' }}
          >
            Contratar
          </Link>
        </div>
      </div>
    </nav>
  );
}
