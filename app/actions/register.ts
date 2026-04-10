'use server';

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
export async function registerUser(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await supabase.from('users').insert([
    {
      username,
      password: hash,
    },
  ]);

  if (error) return { error: error.message };

  return { success: true };
}
