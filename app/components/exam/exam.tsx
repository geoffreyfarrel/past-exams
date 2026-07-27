import { Button, Spinner } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { IoArrowBack } from 'react-icons/io5';

import { getExamDownloadUrl } from '@/app/actions/exams';
import { Exam as ExamType } from '@/app/types/database';
import { MajorService } from '@/services/major-service';
import { createClient } from '@/utils/supabase/client';

interface ExamProps {
  courseId: string;
  examId: string;
}

export default function Exam(props: ExamProps): ReactNode {
  const { courseId, examId } = props;

  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [exam, setExam] = useState<ExamType | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (courseId && examId) {
      const fetchExamData = async (): Promise<void> => {
        try {
          const examData = await MajorService.getExamById(examId, supabase);
          setExam(examData);

          if (examData?.file_key) {
            const { url } = await getExamDownloadUrl(examData.file_key);
            if (url) {
              setPdfUrl(url);
            } else {
              // error
            }
          }
        } catch {
          // error
        } finally {
        }
      };

      fetchExamData();
    }
  }, [courseId, examId, supabase]);

  if (!pdfUrl || !exam)
    return (
      <div className="flex justify-center h-full items-center p-12">
        <Spinner size="lg" variant="dots" />
      </div>
    );

  return (
    <div>
      <div className="flex flex-row items-center">
        <Button
          variant="link"
          size="lg"
          type="button"
          onPress={() => router.back()}
          aria-label="Go back"
          className="flex items-center gap-1 mb-4 text-sm font-normal hover:underline"
        >
          <IoArrowBack size="lg" />
        </Button>
        <h2 className="font-bold text-3xl uppercase mb-4 text-center">{exam?.name}</h2>
      </div>
      {pdfUrl && (
        <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-2xl relative">
          <iframe src={pdfUrl} className="w-full h-screen" title="Exam Viewer" />
        </div>
      )}
    </div>
  );
}
