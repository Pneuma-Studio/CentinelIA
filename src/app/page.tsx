import Link from 'next/link';
import Image from 'next/image';
import {
  Phone, Users, CalendarDays, ShoppingBag,
  MessageCircle, BarChart3, PhoneOff, TrendingDown,
  Clock, Check, ArrowRight, Play, Target, Rocket, Star,
} from 'lucide-react';
import LandingNav from './LandingNav';
import LandingWidgets from './LandingWidgets';
import RotatingNiche from './RotatingNiche';
import FaqSection from './FaqSection';
import DemoSelector from './DemoSelector';
import AnimatedSection from './AnimatedSection';
import AudioWaveform from './AudioWaveform';
import Marquee from './Marquee';

// ─── Demo agent ───────────────────────────────────────────────────────────────
// Reemplaza con el número real del agente demo cuando esté configurado
const DEMO_PHONE      = '+52 (81) 000-0000';
const DEMO_PHONE_HREF = 'tel:+5281000000';

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon:  <Phone size={20} color="#6C3BFF" />,
    color: '#6C3BFF',
    title: 'Recepcionista 24/7',
    desc:  'Atiende cada llamada aunque estés en junta, comiendo o durmiendo. Sin pausas, sin ausencias, sin costo extra.',
  },
  {
    icon:  <Users size={20} color="#7c3aed" />,
    color: '#7c3aed',
    title: 'Captura de leads',
    desc:  'Registra nombre, contacto y necesidades de cada prospecto y los guarda en tu portal automáticamente.',
  },
  {
    icon:  <CalendarDays size={20} color="#2563eb" />,
    color: '#2563eb',
    title: 'Agenda de citas',
    desc:  'Confirma, modifica y cancela citas sin que muevas un dedo. El cliente habla, el agente registra.',
  },
  {
    icon:  <ShoppingBag size={20} color="#d97706" />,
    color: '#d97706',
    title: 'Toma de pedidos',
    desc:  'Registra pedidos por teléfono con todos los detalles: productos, cantidades y dirección de entrega.',
  },
  {
    icon:  <MessageCircle size={20} color="#9B6DFF" />,
    color: '#9B6DFF',
    title: 'Resúmenes por WhatsApp',
    desc:  'Recibe un resumen de cada llamada en tiempo real. Sabes qué pasó sin escuchar la grabación.',
  },
  {
    icon:  <BarChart3 size={20} color="#0891b2" />,
    color: '#0891b2',
    title: 'Portal de reportes',
    desc:  'Monitorea llamadas, leads, citas y minutos desde tu portal exclusivo. Todo en un solo lugar.',
  },
];

const PAINS = [
  {
    icon:  <PhoneOff size={22} color="#dc2626" />,
    stat:  '62%',
    label: 'de los clientes no vuelve a llamar si no contestan a la primera.',
    color: '#dc2626',
  },
  {
    icon:  <TrendingDown size={22} color="#d97706" />,
    stat:  '5–20',
    label: 'oportunidades semanales se pierden solo por no contestar el teléfono.',
    color: '#d97706',
  },
  {
    icon:  <Clock size={22} color="#6b7280" />,
    stat:  '16 h',
    label: 'al día tu negocio está cerrado — pero tus clientes no dejan de llamar.',
    color: '#6b7280',
  },
];

const PLANS: {
  name: string; price: number; origPrice: number; setup: number; origSetup: number;
  minutes: number; color: string; popular?: boolean; includes: string[];
}[] = [
  {
    name: 'Recepcionista', price: 1990, origPrice: 2490, setup: 4990, origSetup: 6990, minutes: 200, color: '#6b7280',
    includes: ['Recepcionista 24/7', 'Agenda de citas', 'Resúmenes WhatsApp + Email', 'Portal con horas pico', '200 min/mes incluidos'],
  },
  {
    name: 'Comercial', price: 3490, origPrice: 4490, setup: 7990, origSetup: 9990, minutes: 500, color: '#6C3BFF', popular: true,
    includes: ['Todo Recepcionista', 'Captura de leads', 'Toma de pedidos', 'Escalación a WhatsApp', 'Reporte semanal', '500 min/mes incluidos'],
  },
  {
    name: 'Pro', price: 6490, origPrice: 8490, setup: 12990, origSetup: 16990, minutes: 1000, color: '#7c3aed',
    includes: ['Todo Comercial', 'Transferencia inteligente', 'Voz + nombre personalizable', 'Multiidioma (ES + EN)', 'Grabaciones 7 días', '1,000 min/mes incluidos'],
  },
];

const fmt = (n: number) => new Intl.NumberFormat('es-MX').format(n);

// ─── Shared tokens ────────────────────────────────────────────────────────────

const C = {
  bg:       '#FAFBFF',
  bgAlt:    '#F4F0FF',
  surface:  '#FFFFFF',
  border:   'rgba(108,59,255,0.1)',
  text:     '#1A0A3B',
  textSub:  'rgba(26,10,59,0.55)',
  textMute: 'rgba(26,10,59,0.38)',
  accent:   '#6C3BFF',
  accentLt: '#9B6DFF',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ background: C.bg, color: C.text, overflowX: 'hidden' }}>
      <LandingNav />

      {/* ── HERO — full-screen cinematic image ───────────────────────────── */}
      <section className="relative film-grain" style={{ minHeight: '100svh', display: 'flex', alignItems: 'flex-start' }}>

        {/* Background image */}
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          priority
          quality={100}
          sizes="(max-width: 640px) 200vw, (max-width: 1280px) 150vw, 100vw"
          className="hero-bg-img"
          style={{ objectFit: 'cover', objectPosition: 'center 72%' }}
        />

        {/* Base dark overlay — ensures readability on mobile */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,1,18,0.55)' }} />
        {/* Left-to-right gradient — adds depth on larger screens */}
        <div className="hidden sm:block" style={{
          position:   'absolute',
          inset:      0,
          background: 'linear-gradient(95deg, rgba(5,1,18,0.5) 0%, rgba(5,1,18,0.3) 45%, transparent 75%)',
        }} />

        {/* Animated orbs */}
        <div className="orb" style={{
          width: 480, height: 480,
          top: -60, left: -120,
          background: 'radial-gradient(circle, rgba(108,59,255,0.35) 0%, transparent 65%)',
          ['--orb-dur' as string]: '9s',
          zIndex: 1,
        }} />
        <div className="orb" style={{
          width: 320, height: 320,
          top: 80, right: '15%',
          background: 'radial-gradient(circle, rgba(155,109,255,0.2) 0%, transparent 65%)',
          ['--orb-dur' as string]: '12s',
          animationDelay: '-4s',
          zIndex: 1,
        }} />

        {/* Bottom fade → blends into light page */}
        <div style={{
          position:   'absolute',
          bottom:     0,
          left:       0,
          right:      0,
          height:     36,
          background: `linear-gradient(to bottom, transparent, ${C.bg})`,
          zIndex:     2,
        }} />

        {/* Content — centered on mobile, left-aligned on sm+ */}
        <div className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 text-center sm:text-left" style={{ paddingTop: 100, paddingBottom: 80, zIndex: 3 }}>
          <div className="mx-auto sm:mx-0" style={{ maxWidth: 560 }}>

            {/* Live waveform indicator */}
            <div className="inline-flex items-center gap-3 mb-6">
              <span
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: '#C4A8FF' }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px #4ade80' }} />
                AGENTE EN LÍNEA
              </span>
              <AudioWaveform barCount={22} />
            </div>

            {/* Eyebrow */}
            <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Agente de voz con inteligencia artificial
            </p>

            {/* Headline */}
            <h1
              className="font-bold leading-[1.06] tracking-tight mb-3"
              style={{ fontSize: 'clamp(2.8rem, 6vw, 5.2rem)', color: '#fff' }}
            >
              El que contesta,
              <br />
              <span style={{
                background:           'linear-gradient(135deg, #9B6DFF 0%, #C4A8FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
              }}>
                vende.
              </span>
            </h1>

            {/* Rotating niche */}
            <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Perfecto para <RotatingNiche />
            </p>

            {/* Sub */}
            <p
              className="mb-8 leading-relaxed"
              style={{ fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', color: 'rgba(255,255,255,0.62)' }}
            >
              Centinelia atiende tus llamadas, agenda citas y captura leads con
              inteligencia artificial — las 24 horas, los 7 días, sin que tengas
              que estar presente.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-10">
              <Link
                href="/registro"
                className="cta-pulse flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #6C3BFF, #9B6DFF)',
                  color:      '#fff',
                }}
              >
                Contratar ahora <ArrowRight size={15} />
              </Link>
              <a
                href="#demo"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-medium transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color:      'rgba(255,255,255,0.82)',
                  border:     '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Play size={13} style={{ fill: 'currentColor' }} /> Prueba la demo
              </a>
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2">
              {['Sin contrato mínimo', 'Activo en menos de 24 h', 'Número local incluido', 'Soporte en español'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  <Check size={11} color="#9B6DFF" /> {t}
                </span>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER ───────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, paddingTop: 14, paddingBottom: 14, background: C.bgAlt }}>
        <Marquee />
      </div>

      {/* ── PROBLEMA ─────────────────────────────────────────────────────── */}
      <section id="problema" style={{ background: '#0D0520', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle orb in dark section */}
        <div className="orb" style={{
          width: 560, height: 560,
          top: -80, left: '50%', transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, rgba(108,59,255,0.18) 0%, transparent 65%)',
          ['--orb-dur' as string]: '11s',
        }} />

        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28" style={{ position: 'relative', zIndex: 1 }}>
          <AnimatedSection className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#9B6DFF' }}>
              El problema
            </p>
            <h2
              className="font-bold tracking-tight mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#fff' }}
            >
              Cada llamada perdida<br />es dinero perdido
            </h2>
            <p className="max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.52)' }}>
              Mientras tu negocio está cerrado, tu competencia contesta.
              Esto le pasa a un negocio promedio cada semana:
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PAINS.map((p, i) => (
              <AnimatedSection key={p.stat} delay={i * 0.1}>
                <div
                  className="rounded-2xl p-6 h-full"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${p.color}18`, border: `1px solid ${p.color}30` }}
                  >
                    {p.icon}
                  </div>
                  <span className="text-4xl font-bold tabular-nums block mb-2" style={{ color: p.color }}>
                    {p.stat}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>{p.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Bridge */}
          <AnimatedSection delay={0.3}>
            <div
              className="mt-8 rounded-2xl px-7 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
              style={{
                background: 'rgba(108,59,255,0.12)',
                border:     `1px solid rgba(108,59,255,0.28)`,
              }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(108,59,255,0.25)', border: '1px solid rgba(108,59,255,0.4)' }}>
                <Target size={18} color="#C4A8FF" />
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: '#fff' }}>
                  Centinelia resuelve los tres problemas a la vez.
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.52)' }}>
                  Un agente de voz entrenado con la información de tu negocio que atiende, captura y agenda —
                  sin que tú tengas que estar presente.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section
        className="py-20 sm:py-28"
        style={{
          background: C.bgAlt,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8">

          {/* Desktop: 2-col — texto izquierda, suricata derecha asomándose sobre las tarjetas */}
          <div className="hidden lg:flex items-end gap-10 mb-0">
            <AnimatedSection className="flex-1">
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: C.accent }}>
                Capacidades
              </p>
              <h2
                className="font-bold tracking-tight mb-4"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: C.text }}
              >
                Todo lo que necesitas,<br />desde el primer día
              </h2>
              <p style={{ color: C.textSub }}>
                Tu agente aprende sobre tu negocio y comienza a atender llamadas en menos de 24 horas.
              </p>
            </AnimatedSection>

            {/* Suricata — marginBottom negativo la hace sobresalir encima de las tarjetas */}
            <div className="relative flex-shrink-0 pointer-events-none select-none"
              style={{ width: 280, height: 360, marginBottom: -160 }}>
              <Image src="/agent-f2.png" alt="" fill sizes="280px"
                style={{ objectFit: 'contain', objectPosition: 'top center' }} />
            </div>
          </div>

          {/* Mobile: encabezado centrado */}
          <AnimatedSection className="lg:hidden text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: C.accent }}>
              Capacidades
            </p>
            <h2
              className="font-bold tracking-tight mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: C.text }}
            >
              Todo lo que necesitas,<br />desde el primer día
            </h2>
            <p className="max-w-md mx-auto" style={{ color: C.textSub }}>
              Tu agente aprende sobre tu negocio y comienza a atender llamadas en menos de 24 horas.
            </p>
          </AnimatedSection>

          {/* Tarjetas — z-index:1 cubre los pies de la suricata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            style={{ position: 'relative', zIndex: 1 }}>
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="rounded-2xl p-6"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}10`, border: `1px solid ${f.color}22` }}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: C.text }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.textSub }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <AnimatedSection className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: C.accent }}>
            Cómo funciona
          </p>
          <h2
            className="font-bold tracking-tight"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: C.text }}
          >
            En línea en 3 pasos
          </h2>
        </AnimatedSection>

        {/* Steps + character side by side */}
        <div className="flex items-start gap-8 lg:gap-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-8 flex-1">
            {[
              { n: '01', title: 'Elige tu plan y paga',       desc: 'Selecciona el plan que se adapte a tu negocio y completa el pago en línea. Tarda menos de 5 minutos.' },
              { n: '02', title: 'Configura tu agente',         desc: 'Accede a tu portal, agrega la información de tu negocio y personaliza cómo responde tu agente.' },
              { n: '03', title: 'Empieza a recibir llamadas',  desc: 'Tu número queda activo en horas. Tu agente atiende, tú solo monitoreas desde el portal.' },
            ].map(s => (
              <div key={s.n} className="flex gap-5 items-start">
                <span
                  className="font-bold tabular-nums flex-shrink-0"
                  style={{ fontSize: '2.8rem', color: 'rgba(108,59,255,0.18)', lineHeight: 1, minWidth: 64 }}
                >
                  {s.n}
                </span>
                <div className="pt-1">
                  <h3 className="font-semibold mb-1.5" style={{ color: C.text }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.textSub }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Character — cover + objectPosition muestra cuerpo completo sin letterbox */}
          <div className="hidden lg:block relative flex-shrink-0" style={{ width: 340, height: 450 }}>
            <Image src="/agent-duo-stand2.png" alt="Agentes CentinelIA" fill
              sizes="340px" style={{ objectFit: 'cover', objectPosition: 'center 85%' }} />
          </div>
        </div>
      </section>

      {/* ── DEMO EN VIVO ─────────────────────────────────────────────────── */}
      <section id="demo" style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: C.accent }}>
              Demo en vivo
            </p>
            <h2
              className="font-bold tracking-tight mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: C.text }}
            >
              Escúchalo antes de decidir
            </h2>
            <p className="max-w-lg mx-auto" style={{ color: C.textSub }}>
              Llama al agente demo y pruébalo en vivo. Invéntate el negocio que quieras
              o pídele que elija un escenario por ti — él lleva la conversación.
            </p>
          </AnimatedSection>

          <DemoSelector demoPhone={DEMO_PHONE} demoPhoneHref={DEMO_PHONE_HREF} />
        </div>
      </section>

      {/* ── PLANES ───────────────────────────────────────────────────────── */}
      <section
        className="py-20 sm:py-28"
        style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <AnimatedSection className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ background: 'rgba(108,59,255,0.08)', border: '1px solid rgba(108,59,255,0.2)', color: C.accent }}>
              <Rocket size={12} /> Precio de lanzamiento · Primeros 20 clientes
            </div>
            <h2
              className="font-bold tracking-tight mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: C.text }}
            >
              El precio correcto<br />para tu negocio
            </h2>
            <p style={{ color: C.textSub }}>Sin contratos de permanencia. Cancela cuando quieras.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PLANS.map(p => (
              <div
                key={p.name}
                className="rounded-2xl p-6 flex flex-col relative overflow-hidden"
                style={{
                  background: p.popular ? `${p.color}08` : C.surface,
                  border:     `1px solid ${p.popular ? p.color + '35' : C.border}`,
                  boxShadow:  p.popular ? `0 8px 32px ${p.color}18` : 'none',
                }}
              >
                {/* Top accent stripe */}
                {p.popular && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${p.color}, ${p.color}88)` }} />
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold" style={{ color: C.text }}>{p.name}</p>
                    {p.popular && (
                      <span
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: p.color, color: '#fff' }}
                      >
                        <Star size={9} style={{ fill: '#fff' }} /> Popular
                      </span>
                    )}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}>
                    Lanzamiento
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-3xl font-bold tabular-nums" style={{ color: p.popular ? p.color : C.text }}>
                    ${fmt(p.price)}
                  </span>
                  <span className="text-sm" style={{ color: C.textMute }}>/mes</span>
                  <span className="text-sm line-through" style={{ color: C.textMute }}>
                    ${fmt(p.origPrice)}
                  </span>
                </div>
                <p className="text-xs mb-5" style={{ color: C.textMute }}>
                  + ${fmt(p.setup)} instalación{' '}
                  <span className="line-through" style={{ color: C.textMute }}>${fmt(p.origSetup)}</span>
                  {' '}· {fmt(p.minutes)} min incluidos
                </p>

                <ul className="flex flex-col gap-2 flex-1 mb-6">
                  {p.includes.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: C.textSub }}>
                      <Check size={13} color={p.color} className="flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/registro"
                  className="text-center py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    background: p.popular ? p.color : 'transparent',
                    color:      p.popular ? '#fff' : p.color,
                    border:     p.popular ? 'none' : `1.5px solid ${p.color}`,
                  }}
                >
                  Contratar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: C.accent }}>
            Preguntas frecuentes
          </p>
          <h2
            className="font-bold tracking-tight"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: C.text }}
          >
            Resolvemos tus dudas
          </h2>
        </div>
        <FaqSection />
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#1A0A3B' }}>
        {/* Glow */}
        <div style={{
          position:     'absolute',
          top:          0,
          left:         '50%',
          transform:    'translateX(-50%)',
          width:        700,
          height:       500,
          background:   'radial-gradient(circle, rgba(108,59,255,0.3) 0%, transparent 65%)',
          pointerEvents:'none',
          zIndex:       0,
        }} />

        {/* Centered text — bottom padding creates space for the duo below */}
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 pt-24 sm:pt-28 text-center" style={{ zIndex: 2, paddingBottom: 280 }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#9B6DFF' }}>
            Tu equipo te espera
          </p>
          <h2
            className="font-bold tracking-tight mb-5"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#fff' }}
          >
            Mientras tú atiendes tu negocio,<br />ellos atienden el teléfono.
          </h2>
          <p className="mb-8" style={{ color: 'rgba(255,255,255,0.52)' }}>
            Tu agente puede estar en línea en menos de 24 horas.<br />
            Sin contratos largos. Sin complicaciones.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/registro"
              className="cta-pulse inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #6C3BFF, #9B6DFF)',
                color:      '#fff',
              }}
            >
              Contratar ahora <ArrowRight size={15} />
            </Link>
            <a
              href={DEMO_PHONE_HREF}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-medium transition-all hover:opacity-90"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color:      'rgba(255,255,255,0.72)',
                border:     '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <Phone size={14} /> Habla con un asesor
            </a>
          </div>
        </div>

        {/* Duo — peeking up from the bottom edge */}
        <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: 580, height: 420, zIndex: 1 }}>
          <Image src="/agent-duo-call.png" alt="Equipo CentinelIA" fill
            sizes="580px" style={{ objectFit: 'contain', objectPosition: 'bottom center' }} />
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Centinelia"
            width={130}
            height={36}
            style={{ height: 36, width: 'auto', objectFit: 'contain' }}
          />
          <span className="text-xs" style={{ color: C.textMute }}>
            · <a href="https://pneumastudio.mx" target="_blank" rel="noopener noreferrer" style={{ color: '#00f5ff' }} className="hover:opacity-80 transition-opacity">Pneuma Studio</a> · Hecho en México
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/portal/login" className="text-xs transition-colors" style={{ color: C.textMute }}>
            Portal de clientes
          </Link>
          <Link href="/registro" className="text-xs" style={{ color: C.textMute }}>
            Contratar
          </Link>
          <a href="mailto:hola@centinelia.mx" className="text-xs" style={{ color: C.textMute }}>
            hola@centinelia.mx
          </a>
        </div>
      </footer>

      <LandingWidgets />
    </div>
  );
}
