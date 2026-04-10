import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthLayout(props: AuthLayoutProps): Promise<ReactNode> {
  const { children } = props;

  return <div className="w-full">{children}</div>;
}
