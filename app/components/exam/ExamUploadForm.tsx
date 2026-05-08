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

import { getPresignedUploadUrl, saveExamMetadata } from '@/app/actions/upload-action';
import { Major } from '@/app/types/database';
import { MajorService } from '@/services/major-service';
import { createClient } from '@/utils/supabase/client';

export function ExamUploadForm(): ReactElement {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [courseId, setCourseId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState('Spring');
  const [professorName, setProfessorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        setError('Only PDF files are allowed');
        setFile(null);

        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be under 10MB');
        setFile(null);

        return;
      }

      setError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!file || !courseId || !year || !semester || !professorName) {
      setError('Please fill in all fields and select a file.');

      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Get presigned URL
      const {
        success,
        uploadUrl,
        fileKey,
        error: presignedError,
      } = await getPresignedUploadUrl(file.name, file.type, file.size);

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
        courseId,
        year: Number(year),
        semester,
        professorName,
        fileKey,
      });

      if (!metaRes.success) {
        throw new Error(metaRes.error || 'Failed to save exam details');
      }

      // Success
      alert('Exam uploaded successfully!');
      router.push('/exams');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8 border border-default-200">
      <CardBody className="p-8">
        <h2 className="text-2xl font-bold mb-6">Upload Past Exam</h2>

        {error && (
          <div className="bg-danger-50 text-danger-600 p-4 rounded-lg mb-6 border border-danger-200">
            {error}
          </div>
        )}

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
            onSelectionChange={(key): void => setCourseId((key as string) || '')}
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
              <SelectItem key="Spring">Spring/1</SelectItem>
              <SelectItem key="Fall">Fall/2</SelectItem>
            </Select>
          </div>

          <Input
            label="Professor Name"
            placeholder="e.g., Dr. Smith"
            value={professorName}
            onValueChange={setProfessorName}
            isRequired
            variant="bordered"
          />

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
            size="lg"
          >
            Upload Exam
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
