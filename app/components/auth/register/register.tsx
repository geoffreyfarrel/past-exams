'use client';

import { Button, Input, Spinner } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useRef, useState } from 'react';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { RxCross1 } from 'react-icons/rx';
import z from 'zod';

import { useToast } from '@/app/contexts/toast-context';
import { createClient } from '@/utils/supabase/client';

const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters long.')
  .max(20, 'Username must be at most 20 characters long.');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .max(16, 'Password must be at most 16 characters long.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.');

export default function Register(): ReactNode {
  const router = useRouter();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid =
    username && !usernameError && email && !emailError && password && !passwordError;

  const emailInputRef = useRef<HTMLInputElement>(null);

  const validateUsername = (value: string): string => {
    if (!value) return '';
    const result = usernameSchema.safeParse(value);

    return result.success ? '' : (result.error.issues[0]?.message ?? 'Invalid username');
  };

  const validateEmail = (value: string): string => {
    if (!value) return '';
    const result = z.email().safeParse(value);

    return result.success ? '' : 'Invalid email address';
  };

  const validatePassword = (value: string): string => {
    if (!value) return '';
    const result = passwordSchema.safeParse(value);

    return result.success ? '' : (result.error.issues[0]?.message ?? 'Invalid password');
  };

  const onUsernameChange = (value: string): void => {
    setUsername(value);
    setUsernameError(validateUsername(value));
  };

  const onEmailChange = (value: string): void => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const onPasswordChange = (value: string): void => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const onTogglePasswordVisibility = (): void => {
    setIsVisible(!isVisible);
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: username,
        },
      },
    });

    if (error) {
      setIsLoading(false);
      showToast(error.message || 'Could not create account. Please try again.', 'error');
    } else {
      showToast('Account created! You can now log in.', 'success');
      router.replace('/auth/login');
    }
  };

  return (
    <section className="flex h-screen w-full bg-slate-100 items-center justify-center p-4">
      <div className="bg-white border-1 border-gray-200 shadow-xl py-10 px-6 sm:px-8 flex flex-col gap-2 w-full max-w-sm">
        <h1 className="text-center font-bold font-mono text-3xl">Register</h1>
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Input
            name="username"
            label={
              <span>
                Username <span className="text-danger">*</span>
              </span>
            }
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            size="md"
            variant="bordered"
            labelPlacement="outside-top"
            placeholder="Please enter a username"
            radius="none"
            isInvalid={!!usernameError}
            errorMessage={usernameError}
            classNames={{
              inputWrapper: [
                'group-data-[focus=true]:border-blue-500',
                'group-data-[hover=true]:!border-blue-500',
              ],
            }}
          />
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
            onValueChange={onPasswordChange}
            size="md"
            variant="bordered"
            labelPlacement="outside-top"
            placeholder="Please enter your password"
            radius="none"
            isInvalid={!!passwordError}
            errorMessage={passwordError}
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
            {isLoading ? <Spinner color="default" /> : 'Register'}
          </Button>
          <div className="grid grid-cols-2">
            <Button
              type="button"
              size="md"
              variant="light"
              color="primary"
              radius="none"
              onPress={() => router.push('/auth/login')}
            >
              Back to Login
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
