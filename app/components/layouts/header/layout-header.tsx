'use client';

import { Navbar, NavbarContent } from '@heroui/navbar';
import { Avatar, Button, Select, SelectItem } from '@heroui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChangeEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import { RxHamburgerMenu } from 'react-icons/rx';

import { useAuth } from '@/app/contexts/auth-context';

import { MAJORS } from './layout-constants';

interface LayoutHeaderProps {
  onMenuToggle: () => void;
}

export default function LayoutHeader({ onMenuToggle }: LayoutHeaderProps): ReactNode {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useAuth();

  const getActiveKey = useCallback(() => {
    const segment = pathname.split('/')[1];

    return MAJORS.find((m) => m.key.toLowerCase() === segment?.toLowerCase())?.key || '';
  }, [pathname]);

  const [value, setValue] = useState(getActiveKey());

  useEffect(() => {
    setValue(getActiveKey());
  }, [getActiveKey]);

  const onMajorChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const newMajor = e.target.value;
      if (newMajor) {
        setValue(newMajor);
        router.push(`/${newMajor.toLowerCase()}`);
      }
    },
    [router],
  );

  return (
    <Navbar isBordered className="bg-white z-50" position="sticky" aria-label="Header">
      <NavbarContent className="lg:hidden w-12" justify="start">
        <Button isIconOnly variant="light" onPress={onMenuToggle}>
          <RxHamburgerMenu className="text-xl" />
        </Button>
      </NavbarContent>

      <NavbarContent className="flex-1 px-2" justify="center">
        {pathname !== '/' && (
          <div className="w-full max-w-40 sm:max-w-60 lg:flex lg:justify-start">
            <Select
              className="w-full"
              placeholder="Select Major"
              variant="flat"
              color="primary"
              size="sm"
              disallowEmptySelection
              selectedKeys={value ? [value] : []}
              onChange={onMajorChange}
              classNames={{
                mainWrapper: 'w-full',
                trigger: 'h-10 min-h-10',
              }}
              aria-label="Major Selection"
            >
              {MAJORS.map((major) => (
                <SelectItem key={major.key} textValue={major.title}>
                  {major.title}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}
      </NavbarContent>

      <NavbarContent className="w-12" justify="end">
        <Link href={profile ? '#' : '/auth/login'}>
          <Avatar
            isBordered
            src="/avatar"
            name={profile?.username || 'Avatar'}
            showFallback
            color="primary"
            size="sm"
          />
        </Link>
      </NavbarContent>
    </Navbar>
  );
}
