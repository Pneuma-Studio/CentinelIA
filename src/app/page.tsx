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
import MeerkatReveal from './MeerkatReveal';
import AudioWaveform from './AudioWaveform';
import Marquee from './Marquee';

// ─── Demo agent ───────────────────────────────────────────────────────────────
// Reemplaza con el número real del agente demo cuando esté configurado
const DEMO_PHONE      = '+52 (81) 2188 8490';
const DEMO_PHONE_HREF = 'tel:+528121888490';

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
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    color: '#4285F4',
    title: 'Reseñas Google automáticas',
    desc:  'Tras cada llamada exitosa, tu agente manda el link de tu reseña Google por WhatsApp. Más reseñas, sin pedir favores.',
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
    icon:  <Clock size={22} color="#eab308" />,
    stat:  '16 h',
    label: 'al día en promedio tu negocio está cerrado, pero tus clientes no dejan de llamar.',
    color: '#eab308',
  },
];

const PLANS: {
  name: string; id: string; price: number; origPrice: number; setup: number; origSetup: number;
  minutes: number; color: string; popular?: boolean; custom?: boolean; includes: string[]; meerkat: string; meerkatBottom: number;
}[] = [
  {
    name: 'Recepcionista', id: 'basico', price: 1990, origPrice: 2490, setup: 4990, origSetup: 6990, minutes: 200, color: '#6b7280',
    includes: ['Recepcionista 24/7', 'Captura de leads', 'Resúmenes WhatsApp + Email', 'Reseña Google automática', 'Portal con horas pico', '200 min/mes incluidos'],
    meerkat: '/agent-plan-basico.png', meerkatBottom: 66,
  },
  {
    name: 'Comercial', id: 'estandar', price: 3490, origPrice: 4490, setup: 7990, origSetup: 9990, minutes: 500, color: '#6C3BFF', popular: true,
    includes: ['Todo Recepcionista', 'Agendamiento de citas', 'Transferencia inteligente', 'Escalación a WhatsApp', 'Reseña Google automática', '500 min/mes incluidos'],
    meerkat: '/agent-plan-estandar.png', meerkatBottom: 64,
  },
  {
    name: 'Pro', id: 'pro', price: 6490, origPrice: 8490, setup: 12990, origSetup: 16990, minutes: 1000, color: '#7c3aed',
    includes: ['Todo Comercial', 'Toma de pedidos', 'Voz + nombre personalizable', 'Multiidioma (ES + EN)', 'Memoria de cliente', 'Reseña Google automática', '1,000 min/mes incluidos'],
    meerkat: '/agent-plan-pro.png', meerkatBottom: 66,
  },
  {
    name: 'Empresarial', id: 'empresarial', price: 0, origPrice: 0, setup: 0, origSetup: 0, minutes: 0, color: '#f59e0b', custom: true,
    includes: ['Todo el plan Pro', 'Integración con tu sistema (POS, CRM, calendario)', 'Flujos conversacionales a medida', 'Múltiples agentes / sucursales', 'Onboarding y capacitación', 'SLA y soporte dedicado'],
    meerkat: '/meerkat-transparente-07.png', meerkatBottom: 66,
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

      {/* ── HERO, full-screen cinematic image ───────────────────────────── */}
      <section className="relative film-grain" style={{ minHeight: '100svh', display: 'flex', alignItems: 'flex-start', overflow: 'hidden', clipPath: 'inset(0 0 0 0)' }}>

        {/* Background image */}
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          priority
          quality={100}
          sizes="(max-width: 640px) 200vw, (max-width: 1280px) 150vw, 100vw"
          className="hero-bg-img"
          style={{ objectFit: 'cover' }}
        />

        {/* Base dark overlay, ensures readability on mobile */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,1,18,0.55)' }} />
        {/* Left-to-right gradient, adds depth on larger screens */}
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

        {/* Bottom fade → blends into Problema dark section */}
        <div style={{
          position:   'absolute',
          bottom:     0,
          left:       0,
          right:      0,
          height:     80,
          background: 'linear-gradient(to bottom, transparent, #0D0520)',
          zIndex:     2,
        }} />

        {/* Content, centered on mobile, left-aligned on sm+ */}
        <div className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 text-center sm:text-left" style={{ paddingTop: 100, paddingBottom: 80, zIndex: 3 }}>
          <div className="mx-auto sm:mx-0" style={{ maxWidth: 560 }}>

            {/* Live waveform indicator */}
            <div className="inline-flex items-center gap-3 mb-6">
              <span
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: '#C4A8FF' }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px #4ade80' }} />
                Centinelia EN LÍNEA
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
              Centinelia atiende tus llamadas, captura leads, agenda citas y
              toma pedidos con IA, las 24 horas, los 7 días, mientras tú
              atiendes lo que importa.
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

      {/* ── PROBLEMA ─────────────────────────────────────────────────────── */}
      <section id="problema" style={{ background: '#0D0520', position: 'relative', transform: 'translateZ(0)' }}>
        {/* Clip layer separate from animated content, prevents Framer Motion repaint flicker */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {/* Pure gradient orb */}
          <div style={{
            position: 'absolute',
            width: 700, height: 700,
            top: -120, left: '50%', transform: 'translateX(-50%)',
            background: 'radial-gradient(circle, rgba(108,59,255,0.14) 0%, rgba(108,59,255,0.06) 40%, transparent 70%)',
            borderRadius: '50%',
          }} />
        </div>

        {/* Suricata, dinero volando, cortada por el borde inferior */}
        <MeerkatReveal className="meerkat-money">
          <Image
            src="/agent-money.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, 140px"
            style={{ objectFit: 'contain', objectPosition: 'top center' }}
          />
        </MeerkatReveal>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:pl-80 py-20 sm:py-28" style={{ position: 'relative', zIndex: 1 }}>

          {/* Mobile: suricata absoluta izquierda, desborda hacia tarjetas */}
          <div className="lg:hidden relative mb-4">
            {/* Suricata, ancla su bottom justo en el top de las tarjetas */}
            <MeerkatReveal className="absolute" style={{ bottom: -16, left: -5, width: 105, height: 188, zIndex: 0, pointerEvents: 'none', userSelect: 'none' }}>
              <Image
                src="/agent-money.png"
                alt=""
                fill
                sizes="105px"
                style={{ objectFit: 'contain', objectPosition: 'top center' }}
              />
            </MeerkatReveal>
            <div style={{ paddingLeft: 112 }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#9B6DFF' }}>
                El problema
              </p>
              <h2
                className="font-bold tracking-tight mb-3"
                style={{ fontSize: 'clamp(1.3rem, 5.5vw, 1.7rem)', color: '#fff', lineHeight: 1.25 }}
              >
                Cada llamada perdida<br />es dinero perdido
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Mientras tu negocio no contesta, tu competencia sí lo hace.
                Esto le pasa a un negocio promedio cada semana:
              </p>
            </div>
          </div>

          {/* Desktop: centered heading */}
          <div className="hidden lg:block text-center mb-14">
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
              Mientras tu negocio no contesta, tu competencia sí lo hace.
              Esto le pasa a un negocio promedio cada semana:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" style={{ position: 'relative', zIndex: 1 }}>
            {PAINS.map((p, i) => (
              <AnimatedSection key={p.stat} delay={i * 0.1}>
              <div
                className="rounded-2xl p-6 h-full"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
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
          <AnimatedSection delay={0.15}>
          <div
            className="mt-8 rounded-2xl px-7 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
            style={{ background: 'rgba(108,59,255,0.12)', border: `1px solid rgba(108,59,255,0.28)` }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(108,59,255,0.25)', border: '1px solid rgba(108,59,255,0.4)' }}>
              <Target size={18} color="#C4A8FF" />
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: '#fff' }}>
                Centinelia resuelve los tres problemas a la vez.
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.52)' }}>
                Un agente de voz entrenado con la información de tu negocio que atiende, captura y agenda,
                sin que tú tengas que estar presente.
              </p>
            </div>
          </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section
        className="py-20 sm:py-28 relative overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at 10% 20%, rgba(108,59,255,0.09) 0%, transparent 55%),
                       radial-gradient(ellipse at 90% 80%, rgba(155,109,255,0.07) 0%, transparent 50%),
                       ${C.bgAlt}`,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8" style={{ position: 'relative', zIndex: 1 }}>

          {/* Desktop: 2-col, texto izquierda, suricata derecha asomándose sobre las tarjetas */}
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

            {/* Suricata flotante */}
            <MeerkatReveal className="agent-float relative flex-shrink-0 pointer-events-none select-none"
              style={{ width: 280, height: 360, marginBottom: -160 }}>
              <Image src="/agent-f2.png" alt="" fill sizes="280px"
                style={{ objectFit: 'contain', objectPosition: 'top center' }} />
            </MeerkatReveal>
          </div>

          {/* Mobile: suricata absoluta derecha, desborda hacia tarjetas */}
          <div className="lg:hidden relative mb-4" style={{ minHeight: 160 }}>
            <MeerkatReveal className="agent-float absolute" style={{ bottom: -50, right: -5, width: 145, height: 145, zIndex: 0, pointerEvents: 'none', userSelect: 'none' }}>
              <Image src="/agent-f2.png" alt="" fill sizes="145px"
                style={{ objectFit: 'contain', objectPosition: 'top center' }} />
            </MeerkatReveal>
            <div style={{ paddingRight: 122 }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: C.accent }}>
                Capacidades
              </p>
              <h2
                className="font-bold tracking-tight mb-3"
                style={{ fontSize: 'clamp(1.3rem, 5.5vw, 1.7rem)', color: C.text, lineHeight: 1.25 }}
              >
                Todo lo que necesitas,<br />desde el primer día
              </h2>
              <p style={{ color: C.textSub, fontSize: '0.875rem', lineHeight: 1.6 }}>
                Tu agente aprende sobre tu negocio y comienza a atender llamadas en menos de 24 horas.
              </p>
            </div>
          </div>

          {/* Tarjetas, z-index:1 cubre los pies de la suricata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:mt-12"
            style={{ position: 'relative', zIndex: 1 }}>
            {FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.07}>
                <div
                  className="feature-card rounded-2xl p-6 h-full"
                  style={{
                    background:  C.surface,
                    border:      `1px solid ${C.border}`,
                    boxShadow:   '0 2px 16px rgba(108,59,255,0.05)',
                  }}
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
              </AnimatedSection>
            ))}
          </div>

          {/* Marquee, debajo de las tarjetas */}
          <div style={{ marginTop: 40, marginLeft: -20, marginRight: -20 }}>
            <Marquee />
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28 pb-40 lg:pb-28 relative overflow-hidden">
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

        {/* Steps + character side by side on desktop, stacked on mobile */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-8 flex-1">
            {[
              { n: '01', title: 'Elige tu plan y paga',       desc: 'Selecciona el plan que se adapte a tu negocio y completa el pago en línea. Tarda menos de 5 minutos.' },
              { n: '02', title: 'Configura tu agente',         desc: 'Accede a tu portal, agrega la información de tu negocio y personaliza cómo responde tu agente.' },
              { n: '03', title: 'Empieza a recibir llamadas',  desc: 'Tu número queda activo en horas. Tu agente atiende, tú solo monitoreas desde el portal.' },
            ].map((s, i) => (
              <AnimatedSection key={s.n} delay={i * 0.12}>
              <div className="flex gap-5 items-start">
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
              </AnimatedSection>
            ))}
          </div>

          {/* Character, desktop: lateral en el flex, mobile: oculto aquí */}
          <MeerkatReveal className="agent-float-slow meerkat-duo-stand overflow-hidden">
            <Image src="/agent-duo-stand2.png" alt="Agentes Centinelia" fill
              sizes="340px"
              style={{ objectFit: 'cover', objectPosition: 'center 85%' }} />
          </MeerkatReveal>
        </div>

        {/* Duo mobile, asomándose desde el borde inferior de la sección */}
        <div className="agent-float-slow meerkat-duo-mob">
          <MeerkatReveal style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Image src="/agent-duo-stand2.png" alt="" fill sizes="220px"
              style={{ objectFit: 'cover', objectPosition: 'center 20%' }} />
          </MeerkatReveal>
        </div>
      </section>

      {/* ── DEMO EN VIVO ─────────────────────────────────────────────────── */}
      <section id="demo" style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
        {/* Headset meerkat, mobile: overflows from Demo into Planes section below */}
        <div className="meerkat-headset-mob">
          <MeerkatReveal style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Image src="/agent-headset.png" alt="" fill sizes="170px"
              style={{ objectFit: 'contain', objectPosition: 'top center' }} />
          </MeerkatReveal>
        </div>
        {/* Desktop: left side */}
        <MeerkatReveal className="agent-sway meerkat-headset-desk-left">
          <Image src="/agent-headset.png" alt="" fill sizes="260px"
            style={{ objectFit: 'contain', objectPosition: 'top center' }} />
        </MeerkatReveal>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-20 pb-44 sm:py-24">
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
              o pídele que elija un escenario por ti, él lleva la conversación.
            </p>
          </AnimatedSection>

          <DemoSelector demoPhone={DEMO_PHONE} demoPhoneHref={DEMO_PHONE_HREF} />
        </div>
      </section>

      {/* ── PLANES ───────────────────────────────────────────────────────── */}
      <section
        className="py-20 sm:py-28 relative overflow-hidden"
        style={{ background: '#0D0520' }}
      >
        {/* Orb de profundidad */}
        <div className="orb" style={{
          width: 600, height: 600,
          top: -100, left: '50%', transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, rgba(108,59,255,0.2) 0%, transparent 65%)',
          ['--orb-dur' as string]: '13s',
        }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ position: 'relative', zIndex: 1 }}>
          {/* Empresarial meerkat - desktop only, overflows above the 4th card column */}
          <MeerkatReveal className="meerkat-empresarial-desk">
            <Image src="/meerkat-transparente-07.png" alt="" fill sizes="220px"
              style={{ objectFit: 'contain', objectPosition: 'bottom center' }} />
          </MeerkatReveal>

          <AnimatedSection className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ background: 'rgba(108,59,255,0.18)', border: '1px solid rgba(108,59,255,0.35)', color: '#C4A8FF' }}>
              <Rocket size={12} /> Precio de lanzamiento · Primeros 20 clientes
            </div>
            <h2
              className="font-bold tracking-tight mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#fff' }}
            >
              El precio correcto<br />para tu negocio
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Sin contratos de permanencia. Cancela cuando quieras.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {PLANS.map((p, i) => (
              <AnimatedSection key={p.name} delay={i * 0.09}>
              <div
                className="rounded-2xl p-6 flex flex-col relative overflow-hidden h-full"
                style={{
                  background: p.popular
                    ? `linear-gradient(145deg, ${p.color}22, ${p.color}0a)`
                    : 'rgba(255,255,255,0.04)',
                  border:    `1px solid ${p.popular ? p.color + '55' : 'rgba(255,255,255,0.09)'}`,
                  boxShadow:  p.popular ? `0 12px 48px ${p.color}30` : 'none',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Top accent stripe */}
                {p.popular && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${p.color}, ${p.color}88)` }} />
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold" style={{ color: '#fff' }}>{p.name}</p>
                    {p.popular && (
                      <span
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: p.color, color: '#fff' }}
                      >
                        <Star size={9} style={{ fill: '#fff' }} /> Popular
                      </span>
                    )}
                  </div>
                  {!p.custom && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                      Lanzamiento
                    </span>
                  )}
                </div>

                {/* Precio */}
                {p.custom ? (
                  <div className="mb-4">
                    <div className="text-3xl font-bold" style={{ color: p.color }}>A consultar</div>
                    <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Cotización sin compromiso</div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.32)' }}>
                      Próximamente: ${fmt(p.origPrice)}/mes
                    </p>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-bold tabular-nums" style={{ color: p.popular ? p.color : '#fff' }}>
                        ${fmt(p.price)}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>/mes</span>
                    </div>
                  </>
                )}

                {/* Bloque instalación + minutos */}
                <div className="rounded-xl px-3 py-2.5 mb-5 flex flex-col gap-2"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'rgba(255,255,255,0.45)' }}>Instalación</span>
                    <span className="font-semibold" style={{ color: '#fff' }}>
                      {p.custom ? 'Incluida' : `$${fmt(p.setup)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'rgba(255,255,255,0.45)' }}>Minutos incluidos</span>
                    <span className="font-semibold" style={{ color: '#fff' }}>
                      {p.custom ? 'A definir' : `${fmt(p.minutes)} min/mes`}
                    </span>
                  </div>
                </div>

                <ul className="flex flex-col gap-2 flex-1 mb-6">
                  {p.includes.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <Check size={13} color={p.popular ? p.color : '#9B6DFF'} className="flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>

                {/* Mobile peeking meerkat, right side of button */}
                <MeerkatReveal className="block sm:hidden" style={{
                  position: 'absolute', bottom: p.meerkatBottom, right: 10,
                  width: 108, height: 108, zIndex: 0, pointerEvents: 'none', userSelect: 'none',
                }}>
                  <Image src={p.meerkat} alt="" fill sizes="88px"
                    style={{ objectFit: 'cover', objectPosition: 'top center' }} />
                </MeerkatReveal>
                <Link
                  href={`/registro?plan=${p.id}`}
                  className="block text-center py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{
                    background: p.custom ? p.color : p.popular ? p.color : 'rgba(108,59,255,0.2)',
                    color:      '#fff',
                    border:     p.popular || p.custom ? 'none' : `1.5px solid rgba(108,59,255,0.4)`,
                    position:   'relative',
                    zIndex:     1,
                  }}
                >
                  {p.custom ? 'Contactar' : 'Contratar'}
                </Link>
              </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ padding: '0' }}>
        <MeerkatReveal className="agent-float-slow meerkat-faq-desk">
          <Image src="/agent-duo-phones.png" alt="" fill sizes="360px"
            style={{ objectFit: 'contain', objectPosition: 'bottom center' }} />
        </MeerkatReveal>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28" style={{ position: 'relative', zIndex: 2 }}>
        <AnimatedSection className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: C.accent }}>
            Preguntas frecuentes
          </p>
          <h2
            className="font-bold tracking-tight"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: C.text }}
          >
            Resolvemos tus dudas
          </h2>
        </AnimatedSection>
        <FaqSection />
      </div>
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

        {/* Centered text, bottom padding creates space for the duo below */}
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 pt-24 sm:pt-28 text-center" style={{ zIndex: 2, paddingBottom: 'clamp(160px, 30vw, 280px)' }}>
        <AnimatedSection>
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
              href="tel:+528116333559"
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
        </AnimatedSection>
        </div>

        {/* Duo flotante, peeking up from the bottom edge */}
        <MeerkatReveal className="agent-sway absolute bottom-[-50px] sm:bottom-[-80px] left-1/2 -translate-x-1/2 pointer-events-none w-[300px] h-[216px] sm:w-[580px] sm:h-[420px]" style={{ zIndex: 1 }}>
          <Image src="/agent-duo-call.png" alt="Equipo Centinelia" fill
            sizes="(max-width: 640px) 300px, 580px" style={{ objectFit: 'contain', objectPosition: 'bottom center' }} />
        </MeerkatReveal>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        className="max-w-6xl mx-auto px-5 sm:px-8 pt-5 pb-24 sm:py-10 relative"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        {/* Mobile: logo + links en una fila */}
        <div className="flex sm:hidden items-center gap-2">
          <Link href="/" className="transition-opacity hover:opacity-70" style={{ flexShrink: 0, marginLeft: 4.5 }}>
            <Image
              src="/logo-icon.png"
              alt="Centinelia"
              width={52}
              height={52}
              style={{ width: 52, height: 52, objectFit: 'contain', display: 'block' }}
            />
          </Link>
          <div className="flex flex-1 items-center justify-evenly">
            <Link href="/industrias" className="text-xs transition-opacity hover:opacity-70" style={{ color: C.textMute }}>
              Industrias
            </Link>
            <Link href="/registro" className="text-xs transition-opacity hover:opacity-70" style={{ color: C.textMute }}>
              Contratar
            </Link>
            <Link href="/portal/login" className="text-xs transition-opacity hover:opacity-70" style={{ color: C.textMute }}>
              Portal de clientes
            </Link>
          </div>
        </div>

        {/* Mobile: crédito al fondo */}
        <div
          className="sm:hidden flex flex-col items-center"
          style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', gap: 6 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <a href="https://www.instagram.com/centinelia.mx/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition-opacity hover:opacity-70">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="#E1306C" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4" stroke="#E1306C" strokeWidth="2"/>
                <circle cx="17.5" cy="6.5" r="1.2" fill="#E1306C"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/centinelia/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="transition-opacity hover:opacity-70">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/centineliamx/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="transition-opacity hover:opacity-70">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
          <a href="https://pneumastudio.mx" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 10, color: C.textMute }}
            className="hover:opacity-80 transition-opacity whitespace-nowrap"
          >Powered by Pneuma Studio</a>
        </div>

        {/* Desktop: icon + Pneuma | links */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="transition-opacity hover:opacity-70">
              <Image
                src="/logo-icon.png"
                alt="Centinelia"
                width={52}
                height={52}
                style={{ width: 52, height: 52, objectFit: 'contain', display: 'block' }}
              />
            </Link>
            <span className="text-xs" style={{ color: C.textMute }}>
              · <a href="https://pneumastudio.mx" target="_blank" rel="noopener noreferrer" style={{ color: C.textMute }} className="hover:opacity-80 transition-opacity">Powered by Pneuma Studio</a>
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/industrias" className="text-xs transition-colors" style={{ color: C.textMute }}>
              Industrias
            </Link>
            <Link href="/portal/login" className="text-xs transition-colors" style={{ color: C.textMute }}>
              Portal de clientes
            </Link>
            <Link href="/registro" className="text-xs" style={{ color: C.textMute }}>
              Contratar
            </Link>
            <Link href="/privacidad-datos" className="text-xs transition-colors" style={{ color: C.textMute }}>
              Privacidad
            </Link>
            <a href="https://www.instagram.com/centinelia.mx/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition-opacity hover:opacity-70">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="#E1306C" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4" stroke="#E1306C" strokeWidth="2"/>
                <circle cx="17.5" cy="6.5" r="1.2" fill="#E1306C"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/centinelia/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="transition-opacity hover:opacity-70">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/centineliamx/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="transition-opacity hover:opacity-70">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="mailto:hola@centinelia.mx" className="text-xs" style={{ color: C.textMute }}>
              hola@centinelia.mx
            </a>
          </div>
        </div>

      </footer>

      <LandingWidgets />
    </div>
  );
}
