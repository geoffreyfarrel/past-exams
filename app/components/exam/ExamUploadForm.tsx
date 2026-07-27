'use client';

import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, FormEvent, ReactElement, useEffect, useRef, useState } from 'react';
import { IoArrowBackOutline } from 'react-icons/io5';

import { getPresignedUploadUrl, saveExamMetadata } from '@/app/actions/upload-action';
import { useAuth } from '@/app/contexts/auth-context';
import { useToast } from '@/app/contexts/toast-context';
import { ExamTerm, Major } from '@/app/types/database';
import { MajorService } from '@/services/major-service';
import { createClient } from '@/utils/supabase/client';

export function ExamUploadForm(): ReactElement {
  const router = useRouter();
  const { showToast } = useToast();
  const { userId } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState('spring');
  const [examTerm, setExamTerm] = useState<ExamTerm>(ExamTerm.MID);
  const [professorName, setProfessorName] = useState('');
  const [loading, setLoading] = useState(false);

  // Major and Course state
  const [majors, setMajors] = useState<Major[]>([]);
  const [majorSearch, setMajorSearch] = useState('');
  const [selectedMajorId, setSelectedMajorId] = useState('');

  // Filter majors client-side as user types
  const filteredMajors = majors.filter((m) =>
    m.name.toLowerCase().includes(majorSearch.toLowerCase()),
  );

  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [courseInputValue, setCourseInputValue] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [coursePage, setCoursePage] = useState(0);
  const [hasMoreCourses, setHasMoreCourses] = useState(true);

  // Filter courses client-side as user types (on top of server-side results)
  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(courseInputValue.toLowerCase()),
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch majors on mount
  useEffect(() => {
    const fetchMajors = async (): Promise<void> => {
      const supabase = createClient();
      const data = await MajorService.getAllMajors(supabase);
      setMajors(data);
    };

    fetchMajors();
  }, []);

  // Fetch courses when major, search, or page changes
  useEffect(() => {
    if (!selectedMajorId) {
      setCourses([]);

      return;
    }

    if (courseSearch.length > 0 && courseSearch.length < 3) {
      return; // Wait for at least 3 characters
    }

    const fetchCourses = async (): Promise<void> => {
      setIsCoursesLoading(true);
      const supabase = createClient();
      const data = await MajorService.getCoursesByMajorId(selectedMajorId, supabase, {
        search: courseSearch,
        page: coursePage,
        pageSize: 10,
      });

      if (coursePage === 0) {
        setCourses(data);
      } else {
        setCourses((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newCourses = data.filter((c) => !existingIds.has(c.id));

          return [...prev, ...newCourses];
        });
      }

      setHasMoreCourses(data.length === 10);
      setIsCoursesLoading(false);
    };

    fetchCourses();
  }, [selectedMajorId, courseSearch, coursePage]);

  const handleCourseSearchChange = (value: string): void => {
    if (value === courseId) return;

    setCourseInputValue(value);

    // Trigger server-side fetch with debounce for paginated results
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCourseSearch(value);
      setCoursePage(0);
      setHasMoreCourses(true);
    }, 500);
  };

  const loadMoreCourses = (): void => {
    if (!isCoursesLoading && hasMoreCourses) {
      setCoursePage((prev) => prev + 1);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        showToast('Only PDF files are allowed', 'error');
        setFile(null);

        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        showToast('File size must be under 10MB', 'error');
        setFile(null);

        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!file || !courseId || !year || !semester || !examTerm || !professorName) {
      showToast('Please fill in all fields and select a file.', 'warning');

      return;
    }

    if (!userId) {
      showToast('You must be signed in to upload an exam.', 'error');

      return;
    }

    setLoading(true);
    const uploadName = `${year}_${semester}_${courseName}_${professorName}_${examTerm.toUpperCase()}.pdf`;

    try {
      // 1. Get presigned upload URL
      const {
        success,
        uploadUrl,
        fileKey,
        error: presignedError,
      } = await getPresignedUploadUrl(uploadName, file.type, file.size, courseId);

      if (!success || !uploadUrl || !fileKey) {
        throw new Error(presignedError || 'Failed to initialize upload');
      }

      // 2. Upload file directly to Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file to storage');
      }

      // 3. Save metadata to Supabase
      const metaRes = await saveExamMetadata({
        courseName: uploadName,
        courseId,
        year: Number(year),
        semester,
        term: examTerm,
        fileKey,
        uploader_id: userId,
      });

      if (!metaRes.success) {
        throw new Error(metaRes.error || 'Failed to save exam details');
      }

      showToast('Exam uploaded successfully!', 'success');
      router.push(`/`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card radius="none" className="max-w-2xl mx-auto mt-8 border border-default-200">
      <CardBody className="p-8">
        <h2 className="text-2xl font-bold mb-6">Upload Past Exam</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Autocomplete
            label="Major"
            placeholder="Search a major..."
            items={filteredMajors}
            selectedKey={selectedMajorId}
            onInputChange={(val): void => setMajorSearch(val)}
            onSelectionChange={(key): void => {
              setSelectedMajorId((key as string) ?? '');
              setCourseId(''); // Reset course when major changes
              setCourseName('');
              setCourseSearch('');
              setCoursePage(0);
            }}
            isRequired
            variant="bordered"
          >
            {(major) => (
              <AutocompleteItem key={major.id} textValue={major.name}>
                {major.name}
              </AutocompleteItem>
            )}
          </Autocomplete>

          <Autocomplete
            label="Course"
            placeholder="Search a course..."
            items={filteredCourses}
            isLoading={isCoursesLoading}
            isDisabled={!selectedMajorId}
            onInputChange={handleCourseSearchChange}
            selectedKey={courseId}
            onSelectionChange={(key): void => {
              const id = (key as string) || '';

              setCourseId(id);
              setCourseName(courses.find((c) => c.id === id)?.name ?? '');
            }}
            isRequired
            variant="bordered"
            listboxProps={{
              onScroll: (e: React.UIEvent<HTMLElement>): void => {
                const target = e.currentTarget;
                if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
                  loadMoreCourses();
                }
              },
            }}
          >
            {(course) => (
              <AutocompleteItem key={course.id} textValue={course.name}>
                {course.name}
              </AutocompleteItem>
            )}
          </Autocomplete>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Academic Year"
              value={year.toString()}
              onValueChange={(val): void => setYear(Number(val))}
              isRequired
              variant="bordered"
            />
            <Select
              label="Semester"
              placeholder="Select semester"
              selectedKeys={semester ? [semester] : []}
              onChange={(e): void => setSemester(e.target.value)}
              isRequired
              variant="bordered"
            >
              <SelectItem key="spring">Spring/1</SelectItem>
              <SelectItem key="fall">Fall/2</SelectItem>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Exam Term"
              placeholder="Select term"
              selectedKeys={examTerm ? [examTerm] : []}
              onChange={(e): void => setExamTerm(e.target.value as ExamTerm)}
              isRequired
              variant="bordered"
            >
              <SelectItem key={ExamTerm.MID}>Midterm</SelectItem>
              <SelectItem key={ExamTerm.FINAL}>Final</SelectItem>
            </Select>
            <Input
              label="Professor Name"
              placeholder="e.g., 林宏祥"
              value={professorName}
              onValueChange={setProfessorName}
              isRequired
              variant="bordered"
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-default-700 mb-2">
              Exam Document (PDF only, max 10MB)
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              required
              className="block w-full text-sm text-default-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100 cursor-pointer"
            />
          </div>

          <Button
            color="primary"
            type="submit"
            className="w-full mt-8"
            isLoading={loading}
            size="md"
          >
            Upload Exam
          </Button>
          <Button
            color="primary"
            type="button"
            variant="bordered"
            size="md"
            className="w-full mb-4"
            startContent={<IoArrowBackOutline />}
            onPress={() => router.back()}
          >
            Back
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
