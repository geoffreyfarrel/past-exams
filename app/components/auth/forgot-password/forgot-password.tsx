'use client';

import { Button, Input, Spinner } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useRef, useState } from 'react';
import { RxCross1 } from 'react-icons/rx';
import z from 'zod';

import { useToast } from '@/app/contexts/toast-context';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPassword(): ReactNode {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isFormValid = email && !emailError;

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

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      showToast(error.message || 'Could not send reset email. Please try again.', 'error');
    } else {
      setIsSubmitted(true);
      showToast('If an account exists for that email, a reset link has been sent.', 'success');
    }
  };

  return (
    <section className="flex h-screen w-full bg-slate-100 items-center justify-center p-4">
      <div className="bg-white border-1 border-gray-200 shadow-xl py-10 px-6 sm:px-8 flex flex-col gap-2 w-full max-w-sm">
        <h1 className="text-center font-bold font-mono text-3xl">Forgot Password</h1>
        {isSubmitted ? (
          <div className="flex flex-col gap-4 items-center text-center py-4">
            <p className="text-default-600">
              If an account exists for <span className="font-semibold">{email}</span>,
              we&apos;ve sent a password reset link to it.
            </p>
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
          </div>
        ) : (
          <form
            className="flex flex-col gap-4 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <p className="text-default-600 text-sm">
              Enter the email associated with your account and we&apos;ll send you a link to
              reset your password.
            </p>
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
            <Button
              type="submit"
              size="md"
              variant="solid"
              color={!isFormValid ? 'default' : 'primary'}
              radius="none"
              isDisabled={!isFormValid}
              className="mt-6"
            >
              {isLoading ? <Spinner color="default" /> : 'Send Reset Link'}
            </Button>
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
          </form>
        )}
      </div>
    </section>
  );
}
