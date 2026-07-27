'use client';

import { Navbar, NavbarContent } from '@heroui/navbar';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
  User,
} from '@heroui/react';
import { usePathname, useRouter } from 'next/navigation';
import { ChangeEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { MdOutlineLogin, MdOutlineLogout } from 'react-icons/md';
import { RxHamburgerMenu } from 'react-icons/rx';

import { useAuth } from '@/app/contexts/auth-context';
import { createClient } from '@/utils/supabase/client';

import { MAJORS } from './layout-constants';

interface LayoutHeaderProps {
  onMenuToggle: () => void;
}

export default function LayoutHeader({ onMenuToggle }: LayoutHeaderProps): ReactNode {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

  const onLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }, [router]);

  return (
    <>
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
          {profile ? (
            <div className="flex flex-row gap-2 items-center">
              {profile.role === 'admin' && (
                <>
                  <Button
                    isIconOnly
                    variant="ghost"
                    color="primary"
                    onPress={() => router.push('/')}
                    className="sm:hidden"
                    aria-label="Upload"
                  >
                    <IoCloudUploadOutline className="text-xl" />
                  </Button>
                  <Button
                    variant="ghost"
                    color="primary"
                    onPress={() => router.push('/upload')}
                    className="hidden sm:flex items-center"
                    startContent={<IoCloudUploadOutline className="text-xl shrink-0" />}
                  >
                    Upload
                  </Button>
                </>
              )}
              <Dropdown>
                <DropdownTrigger className="hover:cursor-pointer">
                  <User
                    as="button"
                    avatarProps={{
                      isBordered: true,
                      src: '/avatar',
                      color: 'primary',
                      showFallback: true,
                      size: 'sm',
                    }}
                    name={profile?.username || 'Avatar'}
                    description={`Role: ${profile?.role || ''}`}
                    classNames={{
                      base: 'p-2 rounded-lg transition-colors hover:bg-blue-100',
                      wrapper: 'hidden sm:flex',
                    }}
                  />
                </DropdownTrigger>
                <DropdownMenu variant="solid">
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<MdOutlineLogout className="text-xl shrink-0" />}
                    onPress={onOpen}
                  >
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          ) : (
            <Button
              variant="solid"
              color="primary"
              startContent={<MdOutlineLogin className="text-xl shrink-0" />}
              radius="md"
              className="flex items-center"
              onPress={() => router.push('/auth/login')}
            >
              Login
            </Button>
          )}
        </NavbarContent>
      </Navbar>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Confirm Logout</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to log out of your account?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="bordered" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    onClose();
                    onLogout();
                  }}
                >
                  Logout
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
