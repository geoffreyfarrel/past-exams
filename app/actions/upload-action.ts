'use server';

import { DeleteObjectCommand } from '@aws-sdk/client-s3';

import { getUploadPresignedUrl } from '@/lib/storage/r2';
import { s3Client } from '@/utils/r2';
import { createClient } from '@/utils/supabase/server';

export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string,
  fileSize: number,
): Promise<{ success: boolean; uploadUrl?: string; fileKey?: string; error?: string }> {
  // Validate file type and size
  if (fileType !== 'application/pdf') {
    return { success: false, error: 'Only PDF files are allowed' };
  }

  if (fileSize > 10 * 1024 * 1024) {
    // 10MB
    return { success: false, error: 'File size exceeds 10MB limit' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Authentication required' };
  }

  // Generate a unique file key
  const fileKey = `exams/${crypto.randomUUID()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  try {
    const uploadUrl = await getUploadPresignedUrl(fileKey, fileType);

    return { success: true, uploadUrl, fileKey };
  } catch {
    // removed console.error

    return { success: false, error: 'Failed to generate upload URL' };
  }
}

interface ExamMetadataInput {
  courseId: string;
  year: number;
  semester: string;
  professorName: string;
  fileKey: string;
}

export async function saveExamMetadata(
  data: ExamMetadataInput,
): Promise<{ success: boolean; examId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Authentication required' };
  }

  try {
    // Check for duplicate exam
    const { data: existingExam } = await supabase
      .from('exams')
      .select('id, file_key')
      .eq('course_id', data.courseId)
      .eq('year', data.year)
      .eq('semester', data.semester)
      .maybeSingle();

    if (existingExam) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('exams')
        .update({
          file_key: data.fileKey,
          uploaded_by: user.id,
        })
        .eq('id', existingExam.id);

      if (updateError) throw updateError;

      // Delete the old file from R2 to save space
      try {
        const command = new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: existingExam.file_key,
        });
        await s3Client.send(command);
      } catch {
        // failed to delete old file
      }

      return { success: true, examId: existingExam.id };
    }

    // Insert new record
    const { data: insertedData, error } = await supabase
      .from('exams')
      .insert({
        course_id: data.courseId,
        year: data.year,
        semester: data.semester,
        file_key: data.fileKey,
        uploaded_by: user.id,
      })
      .select('id')
      .single();

    if (error) {
      // trigger catch block
      throw error; // Trigger catch block to rollback
    }

    return { success: true, examId: insertedData.id };
  } catch {
    // Failed to save metadata, initiating rollback...
    // Rollback: delete the orphaned file from R2
    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: data.fileKey,
      });
      await s3Client.send(command);
      // Successfully rolled back orphaned file
    } catch {
      // Failed to rollback orphaned file
    }

    return { success: false, error: 'Failed to save exam details. Upload reverted.' };
  }
}
