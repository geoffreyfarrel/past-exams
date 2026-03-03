'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { revalidatePath } from 'next/cache';

import { s3Client } from '@/utils/r2';
import { createClient } from '@/utils/supabase/server';

type UploadResponse = {
  success?: boolean;
  error?: string;
};

export async function handleUpload(formData: FormData): Promise<UploadResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || user) throw new Error('Unauthorized');

    const file = formData.get('file') as File;
    const courseId = formData.get('courseId') as string;
    const year = formData.get('year') as string;
    const semester = formData.get('semester') as string;

    if (!file || file.size <= 0) {
      return { error: 'No file uploaded' };
    }

    if (!courseId) {
      return { error: 'Please select a course' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9]/g, '-').toLocaleLowerCase();
    const fileKey = `exams/${courseId}/${timestamp}-${safeFileName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileKey,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const { error: dbError } = await supabase.from('exams').insert({
      course_id: courseId,
      uploder_id: user.id,
      year: parseInt(year) || new Date().getFullYear(),
      semester: parseInt(semester),
      file_key: fileKey,
      file_type: file.type,
    });

    if (dbError) throw dbError;

    revalidatePath(`/major/[id]`);

    return { success: true };
  } catch (error) {
    return {
      error: (error as Error).message || 'Failed to upload file',
    };
  }
}
