'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { createClient } from '@/utils/supabase/client';

import { Profile } from '../types/database';

type AuthContextType = {
  profile: Profile | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({ profile: null, isLoading: true });

export const AuthProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getProfile = async (userId: string): Promise<void> => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (!error) setProfile(data);
    };

    const fetchInitialUser = async (): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await getProfile(user.id);
      }

      setIsLoading(false);
    };

    fetchInitialUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: unknown, session: { user: { id: string } | null }) => {
        if (session?.user) {
          await getProfile(session.user.id);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      },
    );

    return (): void => subscription.unsubscribe();
  }, [supabase]);

  return <AuthContext.Provider value={{ profile, isLoading }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};
