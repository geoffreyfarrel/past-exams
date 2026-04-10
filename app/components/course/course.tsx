import { Spinner } from '@heroui/react';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';

import { Course as CourseType, Exam } from '@/app/types/database';
import { MajorService } from '@/services/major-service';
import { createClient } from '@/utils/supabase/client';

interface CourseProps {
  majorId: string;
  courseId: string;
}

export default function Course(props: CourseProps): ReactNode {
  const { majorId, courseId } = props;
  const supabase = createClient();

  const [course, setCourse] = useState<CourseType>();
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    if (majorId && courseId) {
      const fetchCourseData = async (): Promise<void> => {
        const courseData = await MajorService.getCourseById(courseId, supabase);
        setCourse(courseData);
      };

      const fetchExamData = async (): Promise<void> => {
        try {
          const examData = await MajorService.getExamsByCourse(courseId, supabase);
          setExams(examData);
        } catch (error) {
          console.error('Error fetching exam data:', error);
        }
      };

      fetchCourseData();
      fetchExamData();
    }
  }, [majorId, courseId, supabase]);

  if (!course || !exams) {
    return (
      <div className="flex justify-center h-full items-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <section className="flex flex-col justify-center p-8 font-bold">
      <h1 className="text-center text-3xl mb-4">{course.name}</h1>
      <div className="flex flex-col gap-4">
        {exams.map((exam) => (
          <Link
            key={exam.id}
            href={`/${majorId}/${courseId}/${exams[0]?.id}`}
            className="border-1 rounded-sm p-3 hover:border-white hover:scale-102 hover:shadow-sm transition-all hover:bg-blue-600/70! hover:text-white font-normal hover:underline underline-offset-4"
          >
            {exam.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
