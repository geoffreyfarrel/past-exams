import { Spinner } from '@heroui/react';
import { ReactNode, useEffect, useState } from 'react';

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
  const [exam, setExam] = useState<ExamType>();
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (courseId && examId) {
      const fetchExamData = async (): Promise<void> => {
        setIsLoading(true);
        try {
          const examData = await MajorService.getExamById(examId, supabase);
          setExam(examData);

          if (examData?.file_key) {
            const { url, error } = await getExamDownloadUrl(examData.file_key);
            if (url) {
              setPdfUrl(url);
            } else {
              console.error(error);
            }
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchExamData();
    }
  }, [courseId, examId, supabase]);

  console.log('log: ', pdfUrl);

  if (!pdfUrl || !exam)
    return (
      <div className="flex justify-center h-full items-center p-12">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div>
      <h2 className="font-bold text-3xl upper mb-4 text-center">{exam?.name}</h2>
      {pdfUrl && (
        <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-2xl relative">
          <iframe src={pdfUrl} className="w-full h-screen" title="Exam Viewer" />
        </div>
      )}
    </div>
  );
}
