import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: '#0D0621' }}
    >
      <div className="relative mb-6" style={{ width: 140, height: 200 }}>
        <Image
          src="/agent-f2.png"
          alt=""
          fill
          sizes="140px"
          style={{ objectFit: 'contain', objectPosition: 'bottom center' }}
        />
      </div>

      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(108,59,255,0.7)' }}>
        Error 404
      </p>
      <h1 className="text-3xl font-bold mb-3" style={{ color: '#fff' }}>
        Esta página no existe
      </h1>
      <p className="text-sm mb-8 max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        La dirección que buscas no está disponible o fue movida.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6C3BFF, #9B6DFF)', color: '#fff' }}
        >
          Ir al inicio
        </Link>
        <Link
          href="/portal/login"
          className="px-6 py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
        >
          Portal de clientes
        </Link>
      </div>
    </div>
  );
}
