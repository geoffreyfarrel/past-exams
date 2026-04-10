'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';

import { Course } from '@/app/types/database';
import { MajorService } from '@/services/major-service';
import { cn } from '@/utils/cn';
import { Categories } from '@/utils/constants';
import { createClient } from '@/utils/supabase/client';

interface LayoutSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function LayoutSidebar(props: LayoutSidebarProps): ReactNode {
  const { isOpen, setIsOpen } = props;
  const pathname = usePathname();
  const [courses, setCourses] = useState<Course[]>([]);

  const supabase = useMemo(() => createClient(), []);

  const majorId = pathname.split('/')[1];
  const isHome = pathname === '/';

  useEffect(() => {
    if (majorId && !isHome) {
      const fetchSidebarData = async (): Promise<void> => {
        const courseData = await MajorService.getCoursesByMajor(majorId, supabase);
        setCourses(courseData);
      };

      fetchSidebarData();
    }
  }, [majorId, isHome, supabase]);

  const groupedCourses = useMemo(() => {
    return Categories.reduce(
      (acc, cat) => {
        acc[cat] = courses.filter((c) => c.category === cat.toLowerCase());

        return acc;
      },
      {} as Record<string, Course[]>,
    );
  }, [courses]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-blue-600 text-white transition-transform duration-300 ease-in-out',
          'w-64 transform shadow-xl',
          'lg:sticky lg:translate-x-0 lg:shadow-none lg:z-30 lg:top-0 lg:h-screen',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col h-full p-6 justify-between overflow-y-auto">
          <div className="flex flex-col">
            <div className="mb-8">
              <h2 className="text-xl font-black tracking-tighter italic">PASTEXAMS</h2>
              <p className="text-xs opacity-70">Student&apos;s Archive</p>
            </div>

            {pathname !== '/' && (
              <nav className="space-y-6 flex-1">
                <div className="text-[10px] uppercase font-bold tracking-widest text-blue-200 mb-2">
                  Browse
                </div>
                {Categories.map((cat) => (
                  <div key={cat} className="flex flex-col gap-1">
                    <h2 className="border-b-2 text-center font-bold pb-1 capitalize text-sm text-blue-100">
                      {cat} Courses
                    </h2>
                    {groupedCourses[cat]?.map((course) => {
                      const isActive = pathname.startsWith(`/${majorId}/${course.id}`);

                      return (
                        <Link
                          aria-label={course.name}
                          key={course.id}
                          href={`/${majorId}/${course.id}`}
                          className={cn(
                            'text-sm p-1 px-2 mx-2 rounded-lg transition-colors',
                            isActive
                              ? 'font-semibold shadow-inner bg-white text-blue-900'
                              : 'text-white/80 hover:text-white hover:bg-white/15',
                          )}
                        >
                          {course.name}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            )}
          </div>

          <div className="pt-6 border-t border-blue-400/30 text-[10px] text-blue-100 italic shrink-0">
            Developed by Geo • 2026
          </div>
        </div>
      </aside>
    </>
  );
}
