'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

import Exam from '@/app/components/exam/exam';

export default function ExamPage(): ReactNode {
  const pathname = usePathname();
  const courseId = pathname.split('/')[2];
  const examId = pathname.split('/')[3];

  return <Exam courseId={courseId} examId={examId} />;
}
