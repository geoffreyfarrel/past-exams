'use server';

import { createClient } from '@/utils/supabase/server';

export default async function loginUser(
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  return { success: true };
}
