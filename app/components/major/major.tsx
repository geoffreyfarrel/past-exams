import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

import { Course, Major as MajorType } from '@/app/types/database';
import { MajorService } from '@/services/major-service';
import { cn } from '@/utils/cn';
import { Categories } from '@/utils/constants';
import { createClient } from '@/utils/supabase/client';

interface MajorProps {
  majorId: string;
}

export default async function Major(props: MajorProps): Promise<ReactNode> {
  const { majorId } = props;
  const supabase = createClient();

  const [major, courses]: [MajorType | null, Course[]] = await Promise.all([
    MajorService.getMajorDetails(majorId, supabase),
    MajorService.getCoursesByMajor(majorId, supabase),
  ]);

  if (!major) notFound();

  const collegeName = Array.isArray(major.colleges)
    ? major.colleges[0]?.name
    : major.colleges?.name;

  return (
    <div className="px-6 py-4 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{major.name}</h1>
        <p className="text-gray-500">{collegeName}</p>
      </header>

      {Categories.map((cat, index) => {
        const isLast = index === Categories.length - 1;

        return (
          <section key={cat} className={cn('mb-10', isLast && 'mb-0')}>
            <h2 className="text-xl font-bold border-b-2 border-primary pb-2 mb-4 uppercase">
              {cat} Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {courses
                .filter((c) => c.category === cat.toLowerCase())
                .map((course) => (
                  <Link
                    key={course.id}
                    href={`/${majorId}/${course.id}`}
                    className="p-4 rounded-xl border bg-white hover:border-primary hover:shadow-sm transition-all"
                  >
                    {course.name}
                  </Link>
                ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
