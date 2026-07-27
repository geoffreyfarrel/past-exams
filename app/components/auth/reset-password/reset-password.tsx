'use client';

import { Button, Input, Spinner } from '@heroui/react';
import { AuthChangeEvent } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import z from 'zod';

import { useToast } from '@/app/contexts/toast-context';
import { createClient } from '@/utils/supabase/client';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .max(16, 'Password must be at most 16 characters long.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.');

type SessionStatus = 'checking' | 'ready' | 'invalid';

export default function ResetPassword(): ReactNode {
  const router = useRouter();
  const { showToast } = useToast();

  const [status, setStatus] = useState<SessionStatus>('checking');
  const [isVisible, setIsVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = password && !passwordError && confirmPassword && !confirmError;

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('ready');
      }
    });

    const verifySession = async (): Promise<void> => {
      const code = new URLSearchParams(window.location.search).get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setStatus('invalid');
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      setStatus(session ? 'ready' : 'invalid');
    };

    verifySession();

    return () => subscription.unsubscribe();
  }, []);

  const validatePassword = (value: string): string => {
    if (!value) return '';
    const result = passwordSchema.safeParse(value);

    return result.success ? '' : (result.error.issues[0]?.message ?? 'Invalid password');
  };

  const validateConfirm = (value: string, original: string): string => {
    if (!value) return '';

    return value === original ? '' : 'Passwords do not match.';
  };

  const onPasswordChange = (value: string): void => {
    setPassword(value);
    setPasswordError(validatePassword(value));
    if (confirmPassword) setConfirmError(validateConfirm(confirmPassword, value));
  };

  const onConfirmPasswordChange = (value: string): void => {
    setConfirmPassword(value);
    setConfirmError(validateConfirm(value, password));
  };

  const onToggleVisibility = (): void => setIsVisible((v) => !v);

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setIsLoading(false);
      showToast(error.message || 'Could not reset password. Please try again.', 'error');
      return;
    }

    await supabase.auth.signOut();
    showToast('Password updated! Please log in with your new password.', 'success');
    router.replace('/auth/login');
  };

  if (status === 'checking') {
    return (
      <section className="flex h-screen w-full bg-slate-100 items-center justify-center p-4">
        <Spinner color="default" />
      </section>
    );
  }

  if (status === 'invalid') {
    return (
      <section className="flex h-screen w-full bg-slate-100 items-center justify-center p-4">
        <div className="bg-white border-1 border-gray-200 shadow-xl py-10 px-6 sm:px-8 flex flex-col gap-4 w-full max-w-sm text-center">
          <h1 className="text-center font-bold font-mono text-3xl">Link Expired</h1>
          <p className="text-default-600">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button
            type="button"
            size="md"
            variant="solid"
            color="primary"
            radius="none"
            onPress={() => router.push('/auth/forgot-password')}
          >
            Request New Link
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-screen w-full bg-slate-100 items-center justify-center p-4">
      <div className="bg-white border-1 border-gray-200 shadow-xl py-10 px-6 sm:px-8 flex flex-col gap-2 w-full max-w-sm">
        <h1 className="text-center font-bold font-mono text-3xl">Reset Password</h1>
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Input
            name="password"
            label={
              <span>
                New Password <span className="text-danger">*</span>
              </span>
            }
            type={isVisible ? 'text' : 'password'}
            value={password}
            onValueChange={onPasswordChange}
            size="md"
            variant="bordered"
            labelPlacement="outside-top"
            placeholder="Please enter your new password"
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
                onClick={onToggleVisibility}
              >
                {isVisible ? <IoEyeOutline /> : <IoEyeOffOutline />}
              </button>
            }
          />
          <Input
            name="confirmPassword"
            label={
              <span>
                Confirm Password <span className="text-danger">*</span>
              </span>
            }
            type={isVisible ? 'text' : 'password'}
            value={confirmPassword}
            onValueChange={onConfirmPasswordChange}
            size="md"
            variant="bordered"
            labelPlacement="outside-top"
            placeholder="Please re-enter your new password"
            radius="none"
            isInvalid={!!confirmError}
            errorMessage={confirmError}
            classNames={{
              inputWrapper: [
                'group-data-[focus=true]:border-blue-500',
                'group-data-[hover=true]:!border-blue-500',
              ],
            }}
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
            {isLoading ? <Spinner color="default" /> : 'Reset Password'}
          </Button>
        </form>
      </div>
    </section>
  );
}
