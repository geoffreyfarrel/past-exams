'use client';

import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { queryMe } from '@/app/actions/auth';
import { createClient } from '@/utils/supabase/client';

import { Profile } from '../types/database';

type AuthContextType = {
  profile: Profile | null;
  userId: string | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  profile: null,
  userId: null,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Memoize getProfile so it can be reused safely in the effect
  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (!error && data) {
        setProfile(data as Profile);
      } else {
        setProfile(null);
      }
    },
    [supabase],
  );

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async (): Promise<void> => {
      // 1. Check current session
      const user = await queryMe();

      if (mounted) {
        if (user) {
          setUserId(user.id);
          await fetchProfile(user.id);
        } else {
          setUserId(null);
          setProfile(null);
        }

        setIsLoading(false);
      }
    };

    initializeAuth();

    // 2. Listen for Auth Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;

      // Reset loading if we're waiting for a new profile fetch
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUserId(session.user.id);
          await fetchProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setProfile(null);
      }

      setIsLoading(false);
    });

    return (): void => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  return (
    <AuthContext.Provider value={{ profile, userId, isLoading }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);
