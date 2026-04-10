/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { SupabaseClient } from '@supabase/supabase-js';

export const MajorService = {
  async getMajorDetails(slug: string, supabase: SupabaseClient) {
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
      console.error('Error fetching major:', error);

      return null;
    }

    return data;
  },

  async getCoursesByMajor(majorCode: string, supabase: SupabaseClient) {
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
      console.error('Error fetching courses:', error);

      return [];
    }

    return data;
  },

  async getCourseById(courseId: string, supabase: SupabaseClient) {
    const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();

    if (error) {
      console.error('Error fetching course:', error);

      return [];
    }

    return data;
  },

  async getExamsByCourse(courseId: string, supabase: SupabaseClient) {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('course_id', courseId)
      .order('year', { ascending: false });

    if (error) {
      console.error('Error fetching exams:', error);

      return [];
    }

    return data;
  },

  async getExamById(examId: string, supabase: SupabaseClient) {
    const { data, error } = await supabase.from('exams').select('*').eq('id', examId).single();

    if (error) {
      console.error('Error fetching exam:', error);

      return null;
    }

    return data;
  },
};
