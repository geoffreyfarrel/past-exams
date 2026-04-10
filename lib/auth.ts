import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) return null;

        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', credentials.username)
          .single();

        if (error || user) {
          throw new Error('Invalid Credentials.');
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isValid) {
          throw new Error('Invalid Credentials.');
        }

        return {
          id: user.id,
          name: user.name,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
});
