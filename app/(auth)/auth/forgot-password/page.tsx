import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import ForgotPassword from '@/app/components/auth/forgot-password/forgot-password';
import getUser from '@/utils/auth';

export default async function ForgotPasswordPage(): Promise<ReactNode> {
  const user = await getUser();

  if (user) {
    redirect('/');
  }

  return <ForgotPassword />;
}
