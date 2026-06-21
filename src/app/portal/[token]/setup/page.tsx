import { createAdminClient } from '@/lib/supabase/admin';
import { notFound, redirect } from 'next/navigation';
import SetupForm from './SetupForm';

interface Props { params: Promise<{ token: string }> }

export default async function SetupPage({ params }: Props) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: agent } = await supabase
    .from('voice_agents')
    .select('id, business_name, portal_password_hash')
    .eq('portal_token', token)
    .single();

  if (!agent) notFound();

  // Already registered → send to login with return URL
  if (agent.portal_password_hash) redirect(`/portal/login?from=/portal/${token}`);

  return <SetupForm token={token} businessName={agent.business_name} />;
}
