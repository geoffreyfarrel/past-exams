import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load variables from your .env
dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Required to bypass RLS and delete all
);

async function seed() {
  console.log('🗑️  Clearing existing data...');

  // 1. Delete in order (Child tables first to avoid Foreign Key errors)
  // We use a filter that matches everything (id is not null)
  await supabase.from('exams').delete().not('id', 'is', null);
  await supabase.from('courses').delete().not('id', 'is', null);
  await supabase.from('majors').delete().not('id', 'is', null);

  console.log('🌱 Starting auto-seed...');

  // 2. Seed Majors
  const { data: majors, error: majorError } = await supabase
    .from('majors')
    .upsert(
      [
        { name: 'Computer Science' },
        { name: 'Electrical Engineering' },
        { name: 'Business Administration' },
        { name: 'Mechanical Engineering' },
      ],
      { onConflict: 'name' },
    )
    .select();

  if (majorError) return console.error('Major Error:', majorError.message);
  console.log('✅ Majors seeded.');

  // Map names to IDs for easier course insertion
  const majorMap = Object.fromEntries(majors.map((m) => [m.name, m.id]));

  // 3. Seed Courses
  const { error: courseError } = await supabase.from('courses').upsert(
    [
      {
        major_id: majorMap['Computer Science'],
        course_name: 'Data Structures',
        teacher_name_cn: '张伟教授',
        teacher_name_en: 'Prof. Wei Zhang',
      },
      {
        major_id: majorMap['Computer Science'],
        course_name: 'Algorithm Design',
        teacher_name_en: 'Dr. Alan Turing',
      },
      {
        major_id: majorMap['Electrical Engineering'],
        course_name: 'Circuit Analysis',
        teacher_name_cn: '李明老师',
      },
      {
        major_id: majorMap['Business Administration'],
        course_name: 'Macroeconomics',
        teacher_name_cn: '陈芳',
        teacher_name_en: 'Prof. Fang Chen',
      },
    ],
    { onConflict: 'major_id, course_name' },
  );

  if (courseError) {
    console.error('Course Error:', courseError.message);
  } else {
    console.log('✅ Courses seeded successfully.');
  }

  console.log('🚀 Database is ready for development!');
}

seed();
