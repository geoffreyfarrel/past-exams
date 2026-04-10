'use client';

import { PropsWithChildren, ReactNode, useState } from 'react';

import LayoutHeader from '../components/layouts/header/layout-header';
import LayoutSidebar from '../components/layouts/sidebar/sidebar';

export default function Layout({ children }: PropsWithChildren): ReactNode {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-x-hidden">
      <LayoutSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <LayoutHeader onMenuToggle={() => setIsOpen(!isOpen)} />
        <main className="flex-1 px-4 sm:px-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
