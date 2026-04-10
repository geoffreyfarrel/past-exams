'use client';

import { HeroUIProvider } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { AuthProvider } from './contexts/auth-context';

export function Providers({ children }: { children: React.ReactNode }): ReactNode {
  const router = useRouter();

  return (
    <AuthProvider>
      <HeroUIProvider navigate={router.push}>{children}</HeroUIProvider>
    </AuthProvider>
  );
}
