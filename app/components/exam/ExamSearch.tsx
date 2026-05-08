'use client';

import { Input } from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReactElement, useEffect, useState, useTransition } from 'react';
import { FiSearch } from 'react-icons/fi';

export function ExamSearch(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [term, setTerm] = useState(searchParams.get('q') || '');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        if (term) {
          params.set('q', term);
        } else {
          params.delete('q');
        }

        router.replace(`?${params.toString()}`);
      });
    }, 300);

    return (): void => clearTimeout(handler);
  }, [term, router, searchParams]);

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <Input
        isClearable
        placeholder="Search by course or professor..."
        startContent={<FiSearch className="text-default-400" />}
        value={term}
        onValueChange={setTerm}
        onClear={(): void => setTerm('')}
        size="lg"
        variant="bordered"
        classNames={{
          inputWrapper: 'bg-white/5 dark:bg-black/20 backdrop-blur-md transition-colors',
        }}
      />
    </div>
  );
}
