import { ReactNode } from 'react';

import getUser from '@/utils/auth';

import Home from '../components/home/home';

export default async function HomePage(): Promise<ReactNode> {
  return <Home />;
}
