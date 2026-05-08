import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { ExamUploadForm } from '@/app/components/exam/ExamUploadForm';
import { createClient } from '@/utils/supabase/server';

export const metadata = {
  title: 'Upload Exam | NTPU Past Exams',
};

export default async function UploadPage(): Promise<ReactNode> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/upload');
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Contribute to the Archive</h1>
        <p className="text-default-500">
          Upload a past examination to help fellow students prepare.
        </p>
      </div>

      <ExamUploadForm />
    </div>
  );
}
