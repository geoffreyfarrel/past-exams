import { ReactElement, Suspense } from 'react';

import { ExamList } from '@/app/components/exam/ExamList';
import { ExamSearch } from '@/app/components/exam/ExamSearch';
import { getExams } from '@/lib/db/exams';

export const metadata = {
  title: 'NTPU Past Exams',
  description: 'Search and download past examinations from NTPU.',
};

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<ReactElement> {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q || '';
  const exams = await getExams(query);

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          NTPU Past Exams
        </h1>
        <p className="text-lg text-default-500 max-w-2xl mx-auto">
          Find previous examinations for your courses to prepare for upcoming tests.
        </p>
      </div>

      <Suspense fallback={<div className="h-12" />}>
        <ExamSearch />
      </Suspense>

      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center text-default-400">
            Loading exams...
          </div>
        }
      >
        <ExamList exams={exams} />
      </Suspense>
    </div>
  );
}
