import { SupabaseClient } from '@supabase/supabase-js';

import { Course, Exam, Major } from '@/app/types/database';

export const MajorService = {
  async getMajorDetails(slug: string, supabase: SupabaseClient): Promise<Major | null> {
    const { data, error } = await supabase
      .from('majors')
      .select(
        `
        id,
        name,
        code,
        colleges (
          id,
          name
        )
      `,
      )
      .eq('code', slug.toUpperCase())
      .maybeSingle();

    if (error) {
      return null;
    }

    return data as Major | null;
  },

  async getCoursesByMajor(majorCode: string, supabase: SupabaseClient): Promise<Course[]> {
    // We use !inner to filter the courses by the linked major's code
    const { data, error } = await supabase
      .from('courses')
      .select(
        `
        id,
        name,
        category,
        course_type,
        majors!inner(code)
      `,
      )
      .eq('majors.code', majorCode.toUpperCase())
      .order('name', { ascending: true });

    if (error) {
      return [];
    }

    return data as Course[];
  },

  async getCourseById(courseId: string, supabase: SupabaseClient): Promise<Course | null> {
    const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();

    if (error) {
      return [] as unknown as Course | null;
    }

    return data as Course | null;
  },

  async getExamsByCourse(courseId: string, supabase: SupabaseClient): Promise<Exam[]> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('course_id', courseId)
      .order('year', { ascending: false });

    if (error) {
      return [];
    }

    return data as Exam[];
  },

  async getExamById(examId: string, supabase: SupabaseClient): Promise<Exam | null> {
    const { data, error } = await supabase.from('exams').select('*').eq('id', examId).single();

    if (error) {
      return null;
    }

    return data as Exam | null;
  },
};
