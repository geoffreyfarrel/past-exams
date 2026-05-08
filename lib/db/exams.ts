import { Exam } from '@/app/types/database';
import { createClient } from '@/utils/supabase/server';

export async function getExams(searchQuery?: string): Promise<Exam[]> {
  const supabase = await createClient();
  let query = supabase.from('exams').select('*').order('created_at', { ascending: false });

  if (searchQuery) {
    query = query.or(`course_id.ilike.%${searchQuery}%,professor_name.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query;
  if (error) {
    // error
    throw new Error('Failed to fetch exams');
  }

  return data as Exam[];
}
