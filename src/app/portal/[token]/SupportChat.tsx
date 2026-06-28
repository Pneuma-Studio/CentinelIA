'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader } from 'lucide-react';

const REVIEW_URL = process.env.NEXT_PUBLIC_CENTINELIA_REVIEW_URL ?? '';

type Message = { role: 'user' | 'assistant'; content: string };

const WELCOME: Message = {
  role: 'assistant',
  content: '¡Hola! Soy el asistente de Centinelia. Puedo ayudarte con dudas sobre tu portal, minutos, configuración del agente o cualquier otra pregunta. ¿En qué te puedo ayudar?',
};

export default function SupportChat() {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<Message[]>([WELCOME]);
  const [input, setInput]         = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    const next: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/portal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!res.ok || !res.body) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Ocurrió un error. Por favor intenta de nuevo.' }]);
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') break;
          try {
            const { text: chunk } = JSON.parse(payload);
            if (chunk) {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return [...prev.slice(0, -1), { role: 'assistant', content: last.content + chunk }];
                }
                return prev;
              });
            }
          } catch { /* ignore malformed chunks */ }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'No pude conectarme. Verifica tu conexión e intenta de nuevo.' }]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-20 right-4 z-50 flex flex-col overflow-hidden"
          style={{
            width: 'min(360px, calc(100vw - 32px))',
            height: 480,
            background: '#1A0B38',
            border: '1px solid rgba(108,59,255,0.35)',
            borderRadius: 20,
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,59,255,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(108,59,255,0.25) 0%, rgba(108,59,255,0.1) 100%)',
              borderBottom: '1px solid rgba(108,59,255,0.2)',
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(108,59,255,0.3)', border: '1px solid rgba(108,59,255,0.4)' }}
            >
              <Bot size={15} color="#A07CFF" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#E2D9FF' }}>Soporte Centinelia</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>En línea</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
                    style={{ background: 'rgba(108,59,255,0.2)', border: '1px solid rgba(108,59,255,0.3)' }}
                  >
                    <Bot size={11} color="#A07CFF" />
                  </div>
                )}
                <div
                  className="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={
                    msg.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, #6C3BFF, #9B6DFF)',
                          color: '#fff',
                          borderBottomRightRadius: 4,
                        }
                      : {
                          background: 'rgba(255,255,255,0.05)',
                          color: 'rgba(255,255,255,0.85)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderBottomLeftRadius: 4,
                        }
                  }
                >
                  {msg.content || (
                    <span className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <Loader size={11} className="animate-spin" /> Escribiendo…
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Escribe tu pregunta…"
              disabled={streaming}
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-sm"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '8px 12px',
                color: '#E2D9FF',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || streaming}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: input.trim() && !streaming ? '#6C3BFF' : 'rgba(108,59,255,0.2)',
                border: '1px solid rgba(108,59,255,0.4)',
                opacity: !input.trim() || streaming ? 0.5 : 1,
              }}
            >
              {streaming
                ? <Loader size={14} color="#A07CFF" className="animate-spin" />
                : <Send size={14} color="#fff" />
              }
            </button>
          </div>
        </div>
      )}

      {/* Review badge — centered between left edge and the support button */}
      {REVIEW_URL && (
        <a
          href={REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 z-50 flex items-center gap-1.5 rounded-full text-[11px] whitespace-nowrap"
          style={{
            left:                 '50%',
            transform:            'translateX(-50%)',
            padding:              '6px 14px',
            background:           'var(--c-surface)',
            border:               '1px solid var(--c-border)',
            boxShadow:            '0 2px 12px rgba(0,0,0,0.18)',
            color:                'var(--c-text-3)',
            textDecoration:       'none',
            backdropFilter:       'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          ¿Qué tal funciona Centinelia?
        </a>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all"
        style={{
          background: open ? 'rgba(108,59,255,0.9)' : 'linear-gradient(135deg, #6C3BFF, #9B6DFF)',
          boxShadow: '0 8px 32px rgba(108,59,255,0.45)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
        aria-label="Soporte"
      >
        {open
          ? <X size={22} color="#fff" />
          : <MessageCircle size={22} color="#fff" />
        }
      </button>
    </>
  );
}
