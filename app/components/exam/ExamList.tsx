'use client';

import { Button, Card, CardBody, CardHeader } from '@heroui/react';
import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

import { getDownloadUrl } from '@/app/actions/download-action';
import { Exam } from '@/app/types/database';

export function ExamList({ exams }: { exams: Exam[] }): React.ReactElement {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (exams.length === 0) {
    return (
      <div className="text-center text-default-500 py-12 bg-white/5 dark:bg-black/10 rounded-2xl border border-default-200">
        <p className="text-lg">No past exams found matching your criteria.</p>
      </div>
    );
  }

  const handleDownload = async (id: string, fileKey: string, fileName: string): Promise<void> => {
    setLoadingId(id);
    try {
      const { success, url } = await getDownloadUrl(fileKey);
      if (success && url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert('Failed to download exam.');
      }
    } catch {
      alert('An error occurred while downloading.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((exam) => (
        <Card
          key={exam.id}
          className="bg-white dark:bg-default-50 border border-default-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <CardHeader className="flex justify-between items-start pb-2 px-5 pt-5">
            <div>
              <h4 className="font-bold text-xl text-default-900">{exam.course_id}</h4>
              <p className="text-sm font-medium text-primary-500">
                {exam.year} • {exam.semester}
              </p>
            </div>
          </CardHeader>
          <CardBody className="px-5 pb-5">
            <p className="text-default-600 mb-6 flex items-center gap-2">
              <span className="text-default-400">Prof.</span> {exam.professor_name}
            </p>
            <Button
              color="primary"
              variant="flat"
              endContent={<FiDownload />}
              isLoading={loadingId === exam.id}
              onPress={() =>
                handleDownload(
                  exam.id,
                  exam.file_key,
                  `${exam.course_id}_${exam.year}_${exam.semester}.pdf`,
                )
              }
              className="w-full font-medium"
            >
              Download PDF
            </Button>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
