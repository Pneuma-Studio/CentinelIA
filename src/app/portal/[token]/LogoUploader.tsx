'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

export default function LogoUploader({ token, currentUrl, compact }: { token: string; currentUrl: string | null; compact?: boolean }) {
  const inputRef            = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const router = useRouter();

  const handleFile = async (file: File) => {
    setError('');
    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setLoading(true);
    const fd = new FormData();
    fd.append('logo', file);

    const res  = await fetch(`/api/portal/${token}/upload-logo`, { method: 'POST', body: fd });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Error al subir');
      setPreview(currentUrl);
    } else {
      setPreview(data.url);
      router.refresh();
    }
    setLoading(false);
    URL.revokeObjectURL(objectUrl);
  };

  const handleRemove = async () => {
    setPreview(null);
    await fetch(`/api/portal/${token}/upload-logo`, {
      method: 'DELETE',
    });
    router.refresh();
  };

  if (compact) return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        title={preview ? 'Cambiar logo' : 'Subir logo'}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
        style={{ background: 'rgba(108,59,255,0.08)', color: '#9B6DFF', border: '1px solid rgba(108,59,255,0.2)', opacity: loading ? 0.6 : 1 }}
      >
        <Upload size={11} /> {loading ? 'Subiendo…' : preview ? 'Cambiar logo' : 'Subir logo'}
      </button>
      {preview && !loading && (
        <button onClick={handleRemove} title="Quitar logo"
          className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
          style={{ color: 'var(--c-text-3)' }}>
          <X size={13} />
        </button>
      )}
      {error && <span className="text-xs" style={{ color: '#dc2626' }}>{error}</span>}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="w-24 h-16 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border)' }}>
          {preview
            ? <img src={preview} alt="Logo" className="w-full h-full object-contain p-1" />
            : <span className="text-2xl select-none opacity-30">🏢</span>
          }
        </div>
        <div className="flex-1">
          <p className="text-xs mb-1" style={{ color: 'var(--c-text-2)' }}>PNG, JPG, SVG o WebP · máx. 2 MB</p>
          <p className="text-xs" style={{ color: 'var(--c-text-3)' }}>Si no subes logo, se muestra el nombre del negocio</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => inputRef.current?.click()} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: 'rgba(108,59,255,0.1)', color: '#6C3BFF', border: '1px solid rgba(108,59,255,0.2)', opacity: loading ? 0.6 : 1 }}>
          <Upload size={14} /> {loading ? 'Subiendo…' : preview ? 'Cambiar logo' : 'Subir logo'}
        </button>
        {preview && !loading && (
          <button onClick={handleRemove}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--c-text-3)' }}>
            <X size={13} /> Quitar
          </button>
        )}
      </div>
      {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
}
