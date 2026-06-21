'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get('from') ?? '';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/portal/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const { token } = await res.json();
      const dest = from.startsWith('/portal/') ? from : `/portal/${token}`;
      router.push(dest);
    } else {
      const { error: msg } = await res.json().catch(() => ({ error: 'Error al iniciar sesión' }));
      setError(msg ?? 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0E0720' }}>
      <div className="w-full max-w-sm">

        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold mb-1" style={{ color: '#FAFBFF' }}>CentinelIA</div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Portal del cliente</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28 }}>

          <h1 className="text-base font-semibold mb-1" style={{ color: '#FAFBFF' }}>Iniciar sesión</h1>

          {error && (
            <div className="px-3 py-2.5 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Correo electrónico</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFBFF' }}
            />
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Contraseña</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFBFF' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity"
            style={{ background: '#6C3BFF', color: '#FAFBFF', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
          ¿Problemas para entrar? Contacta a tu asesor de CentinelIA.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
