import { SupabaseClient } from '@supabase/supabase-js';

import { Course, Exam, Major } from '@/app/types/database';

export const MajorService = {
  async getMajorDetails(supabase: SupabaseClient, slug?: string): Promise<Major | null> {
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
      .eq('code', slug?.toUpperCase())
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

  async getAllMajors(supabase: SupabaseClient): Promise<Major[]> {
    const { data, error } = await supabase.from('majors').select('id, name, code').order('name');

    if (error) {
      return [];
    }

    return data as Major[];
  },

  async getCoursesByMajorId(
    majorId: string,
    supabase: SupabaseClient,
    options?: { search?: string; page?: number; pageSize?: number },
  ): Promise<Course[]> {
    const { search = '', page = 0, pageSize = 10 } = options ?? {};

    let query = supabase
      .from('courses')
      .select('id, name, majors!inner(id)')
      .eq('majors.id', majorId)
      .order('name');

    if (search.length >= 3) {
      query = query.ilike('name', `%${search}%`);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      return [];
    }

    return data as unknown as Course[];
  },
};
