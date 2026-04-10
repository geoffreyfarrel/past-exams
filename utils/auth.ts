import { User } from '@supabase/supabase-js';

import { createClient } from './supabase/server';

export default async function getUser(): Promise<User | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
