import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import EditAgentForm from './EditAgentForm';
import type { VoiceAgent } from '@/types/agent';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarAgentePage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from('voice_agents').select('*').eq('id', id).single();
  if (!data) notFound();
  return <EditAgentForm agent={data as VoiceAgent} />;
}
