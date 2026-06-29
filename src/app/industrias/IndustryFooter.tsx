import Link from 'next/link';
import Image from 'next/image';

export default function IndustryFooter() {
  const textMute = 'rgba(26,10,59,0.35)';

  return (
    <div style={{ background: '#FAFBFF', borderTop: '1px solid rgba(108,59,255,0.12)' }}>
    <footer
      className="max-w-6xl mx-auto px-5 sm:px-8 pt-5 pb-24 sm:py-10 relative"
    >
      {/* Mobile: logo + links */}
      <div className="flex sm:hidden items-center gap-2">
        <Link href="/" className="transition-opacity hover:opacity-70" style={{ flexShrink: 0, marginLeft: 4.5 }}>
          <Image src="/logo-icon.png" alt="Centinelia" width={52} height={52} style={{ width: 52, height: 52, objectFit: 'contain', display: 'block' }} />
        </Link>
        <div className="flex flex-1 items-center justify-evenly">
          <Link href="/industrias" className="text-xs transition-opacity hover:opacity-70" style={{ color: textMute }}>Industrias</Link>
          <Link href="/registro" className="text-xs transition-opacity hover:opacity-70" style={{ color: textMute }}>Contratar</Link>
          <Link href="/portal/login" className="text-xs transition-opacity hover:opacity-70" style={{ color: textMute }}>Portal</Link>
        </div>
      </div>

      {/* Mobile: Pneuma Studio credit */}
      <p
        className="sm:hidden"
        style={{ position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: textMute, textAlign: 'center', lineHeight: 1.4, whiteSpace: 'nowrap', pointerEvents: 'none' }}
      >
        <a href="https://pneumastudio.mx" target="_blank" rel="noopener noreferrer" style={{ color: textMute, pointerEvents: 'auto' }} className="hover:opacity-80 transition-opacity">
          Pneuma Studio
        </a>
        {' · Hecho en México'}
      </p>

      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="transition-opacity hover:opacity-70">
            <Image src="/logo-icon.png" alt="Centinelia" width={52} height={52} style={{ width: 52, height: 52, objectFit: 'contain', display: 'block' }} />
          </Link>
          <span className="text-xs" style={{ color: textMute }}>
            · <a href="https://pneumastudio.mx" target="_blank" rel="noopener noreferrer" style={{ color: textMute }} className="hover:opacity-80 transition-opacity">Pneuma Studio</a> · Hecho en México
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/industrias" className="text-xs transition-colors" style={{ color: textMute }}>Industrias</Link>
          <Link href="/portal/login" className="text-xs transition-colors" style={{ color: textMute }}>Portal de clientes</Link>
          <Link href="/registro" className="text-xs" style={{ color: textMute }}>Contratar</Link>
          <Link href="/privacidad-datos" className="text-xs transition-colors" style={{ color: textMute }}>Privacidad</Link>
          <a href="mailto:hola@centinelia.mx" className="text-xs" style={{ color: textMute }}>hola@centinelia.mx</a>
        </div>
      </div>
    </footer>
    </div>
  );
}
