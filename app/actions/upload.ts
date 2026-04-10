'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

import { s3Client } from '@/utils/r2';

type UploadResponse = {
  success?: boolean;
  error?: string;
};

export async function handleUpload(formData: FormData): Promise<UploadResponse> {
  // Define these outside the try block so they are accessible in catch for rollback
  let insertedExamId: string | number | null = null;
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const file = formData.get('file') as File;
    const courseId = formData.get('courseId') as string;
    const year = formData.get('year') as string;
    const semester = formData.get('semester') as string;

    if (!file || file.size <= 0) return { error: 'No file uploaded' };
    if (!courseId) return { error: 'Please select a course' };

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9]/g, '-').toLocaleLowerCase();
    const fileKey = `exams/${courseId}/${timestamp}-${safeFileName}`;

    // 1. DATABASE INSERT FIRST
    // We use .select() to get the ID back for potential rollback
    const { data, error: dbError } = await supabaseAdmin
      .from('exams')
      .insert({
        course_id: courseId,
        uploader_id: 'fd47051a-572b-48a5-b40f-69ba4f6eb869',
        name: `${year}_${semester}_微積分 Calculus_Mid`,
        year: parseInt(year) || new Date().getFullYear(),
        semester: semester, // Ensure this matches your "exams_semester_check" constraint
        file_key: fileKey,
        file_type: file.type,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    insertedExamId = data.id;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileKey,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    revalidatePath(`/major/[id]`);

    return { success: true };
  } catch (error) {
    if (insertedExamId) {
      await supabaseAdmin.from('exams').delete().eq('id', insertedExamId);
    }

    return {
      error: (error as Error).message || 'Failed to upload file',
    };
  }
}
