'use client';

import { ReactNode, use } from 'react';

import Course from '@/app/components/course/course';

export default function CoursePage({
  params,
}: {
  params: Promise<{ majorId: string; courseId: string }>;
}): ReactNode {
  const { majorId, courseId } = use(params);

  return <Course majorId={majorId} courseId={courseId} />;
}
