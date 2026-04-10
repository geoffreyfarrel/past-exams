import getUser from '@/utils/auth';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthLayout(props: AuthLayoutProps): ReactNode {
  const user = await getUser();

  const { children } = props;

  return <div className="w-full">{children}</div>;
}
