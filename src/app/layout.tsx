import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const BASE_URL = 'https://centinelia.mx';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'CentinelIA — Tu negocio nunca pierde una llamada',
    template: '%s | CentinelIA',
  },
  description:
    'Agentes de voz con IA que atienden las llamadas de tu negocio 24/7. Agenda citas, captura leads y toma pedidos — sin que tú estés presente. Desde $1,990/mes.',
  keywords: [
    'agente de voz IA', 'inteligencia artificial para negocios', 'recepcionista virtual',
    'atención telefónica automatizada', 'chatbot de voz', 'agenda citas automática',
    'captura de leads por teléfono', 'CentinelIA', 'México',
  ],
  authors: [{ name: 'CentinelIA', url: BASE_URL }],
  creator: 'CentinelIA',
  publisher: 'CentinelIA',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: BASE_URL,
    siteName: 'CentinelIA',
    title: 'CentinelIA — Tu negocio nunca pierde una llamada',
    description:
      'Agentes de voz con IA que atienden las llamadas de tu negocio 24/7. Agenda citas, captura leads y toma pedidos — desde $1,990/mes.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CentinelIA — Agentes de voz con IA para tu negocio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CentinelIA — Tu negocio nunca pierde una llamada',
    description:
      'Agentes de voz con IA que atienden las llamadas de tu negocio 24/7. Desde $1,990/mes.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${sora.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
