import { createAdminClient } from '@/lib/supabase/admin';

export async function getKnowledgeBase(key: 'kb_sales' | 'kb_portal'): Promise<string> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', key)
      .single();
    return data?.value?.trim() ?? '';
  } catch {
    return '';
  }
}
