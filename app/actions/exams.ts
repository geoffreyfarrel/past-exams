'use server';

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { s3Client } from '@/utils/r2';
import { createClient } from '@/utils/supabase/server';

type GetSignedUrlResponse = {
  url?: string;
  error?: string;
};

export async function getExamDownloadUrl(fileKey: string): Promise<GetSignedUrlResponse> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: `pastexams/${fileKey}`,
      ResponseContentDisposition: 'inline',
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    return { url };
  } catch {
    return { error: 'Failed to generate access link.' };
  }
}

//eslint-disable-next-line
export async function getExamsByCourse(courseId: string): Promise<{ data: any; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('exams')
    .select(
      `
      id, 
      year, 
      semester, 
      file_key, 
      file_type,
      profiles (nickname) 
    `,
    )
    .eq('course_id', courseId)
    .order('year', { ascending: false });

  return { data, error };
}
