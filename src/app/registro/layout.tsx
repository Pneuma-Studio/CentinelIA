import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contrata tu agente de voz con IA',
  description: 'Activa un agente de voz con IA para tu negocio en menos de 24 horas. Planes desde $1,990/mes. Sin contratos largos. Elige el plan que mejor se adapte a tus necesidades.',
  alternates: {
    canonical: 'https://www.centinelia.mx/registro',
  },
  openGraph: {
    title: 'Contrata tu agente de voz con IA | Centinelia',
    description: 'Activa un agente de voz con IA para tu negocio en menos de 24 horas. Planes desde $1,990/mes.',
    url: 'https://www.centinelia.mx/registro',
  },
};

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
