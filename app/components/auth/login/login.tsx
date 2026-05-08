'use client';

import { Button, Input, Spinner } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useRef, useState } from 'react';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { RxCross1 } from 'react-icons/rx';
import z from 'zod';

import { createClient } from '@/utils/supabase/client';

export default function Login(): ReactNode {
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = email && !emailError && password;

  const emailInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (value: string): string => {
    if (!value) return '';
    const result = z.email().safeParse(value);

    return result.success ? '' : 'Invalid email address';
  };

  const onEmailChange = (value: string): void => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const onTogglePasswordVisibility = (): void => {
    setIsVisible(!isVisible);
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      setIsLoading(false);
      // error.message
    } else {
      router.replace('/');
    }
  };

  return (
    <section className="flex h-screen w-full bg-slate-100 items-center justify-center p-4">
      <div className="bg-white border-1 border-gray-200 shadow-xl py-10 px-6 sm:px-8 flex flex-col gap-2 w-full max-w-sm">
        <h1 className="text-center font-bold font-mono text-3xl">Login</h1>
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Input
            ref={emailInputRef}
            name="email"
            label={
              <span>
                Email <span className="text-danger">*</span>
              </span>
            }
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            size="md"
            variant="bordered"
            labelPlacement="outside-top"
            placeholder="Please enter your email"
            radius="none"
            isInvalid={!!emailError}
            errorMessage={emailError}
            classNames={{
              inputWrapper: [
                'group-data-[focus=true]:border-blue-500',
                'group-data-[hover=true]:!border-blue-500',
              ],
            }}
            endContent={
              <button
                aria-label="clear all"
                type="button"
                className="hover:cursor-pointer border-blue-600"
                onClick={() => {
                  setEmail('');
                  setEmailError('');
                  emailInputRef.current?.focus();
                }}
              >
                {email ? <RxCross1 /> : null}
              </button>
            }
          />
          <Input
            name="password"
            label={
              <span>
                Password <span className="text-danger">*</span>
              </span>
            }
            type={isVisible ? 'text' : 'password'}
            value={password}
            onValueChange={setPassword}
            size="md"
            variant="bordered"
            labelPlacement="outside-top"
            placeholder="Please enter your password"
            radius="none"
            classNames={{
              inputWrapper: [
                'group-data-[focus=true]:border-blue-500',
                'group-data-[hover=true]:!border-blue-500',
              ],
            }}
            endContent={
              <button
                aria-label="toggle password visibility"
                type="button"
                className="hover:cursor-pointer"
                onClick={onTogglePasswordVisibility}
              >
                {isVisible ? <IoEyeOutline /> : <IoEyeOffOutline />}
              </button>
            }
          />
          <Button
            type="submit"
            size="md"
            variant="solid"
            color={!isFormValid ? 'default' : 'primary'}
            radius="none"
            isDisabled={!isFormValid}
            className="mt-6"
          >
            {isLoading ? <Spinner color="default" /> : 'Login'}
          </Button>
          <div className="grid grid-cols-2">
            <Button type="button" size="md" variant="light" color="primary" radius="none">
              Register an Account
            </Button>
            <Button
              type="button"
              size="md"
              variant="light"
              color="primary"
              radius="none"
              onPress={() => router.push('/')}
            >
              Back to Home
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
