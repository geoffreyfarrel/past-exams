import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import Register from '@/app/components/auth/register/register';
import getUser from '@/utils/auth';

export default async function RegisterPage(): Promise<ReactNode> {
  const user = await getUser();

  if (user) {
    redirect('/');
  }

  return <Register />;
}
