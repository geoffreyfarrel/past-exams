import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import Login from '@/app/components/auth/login/login';
import getUser from '@/utils/auth';

export default async function LoginPage(): Promise<ReactNode> {
  const user = await getUser();

  if (user) {
    redirect('/');
  }

  return <Login />;
}
