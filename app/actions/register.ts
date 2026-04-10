'use server';

import z from 'zod';

import { createClient } from '@/utils/supabase/server';

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long.')
    .max(20, 'Username must be at most 20 characters long.'),
  email: z.email('Invalid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(16, 'Password must be at most 16 characters long.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.'),
});

export async function registerUser(
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  const rawData = Object.fromEntries(formData.entries());

  const validatedFields = registerSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;

    const firstErrorMessage = Object.values(fieldErrors).flat()[0];

    return { error: firstErrorMessage || 'Validation failed' };
  }

  const { username, email, password } = validatedFields.data;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: username,
      },
    },
  });

  if (error) return { error: error.message };

  return { success: true };
}
