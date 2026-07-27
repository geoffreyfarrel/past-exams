'use server';

import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { revalidatePath } from 'next/cache';

import { getUploadPresignedUrl } from '@/lib/storage/r2';
import { s3Client } from '@/utils/r2';
import { createClient } from '@/utils/supabase/server';

type AdminCheckResult = { ok: true; userId: string } | { ok: false; error: string };

// Supabase/Postgrest errors don't always satisfy `instanceof Error` (e.g. when the SDK
// is bundled separately for server actions), so fall back to duck-typing the `message` field.
function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;

  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message: unknown }).message;

    if (typeof message === 'string' && message.length > 0) return message;
  }

  return 'Unknown error';
}

async function requireAdmin(): Promise<AdminCheckResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: 'Authentication required' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return { ok: false, error: 'Only admins can upload exams' };
  }

  return { ok: true, userId: user.id };
}

export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string,
  fileSize: number,
  courseId: string,
): Promise<{
  status: number;
  success: boolean;
  uploadUrl?: string;
  fileKey?: string;
  error?: string;
}> {
  // Validate file type and size
  if (fileType !== 'application/pdf') {
    return { status: 400, success: false, error: 'Only PDF files are allowed' };
  }

  if (fileSize > 10 * 1024 * 1024) {
    // 10MB
    return { status: 400, success: false, error: 'File size exceeds 10MB limit' };
  }

  const adminCheck = await requireAdmin();

  if (!adminCheck.ok) {
    return { status: 403, success: false, error: adminCheck.error };
  }

  // Build the file key from the caller-supplied name (path separators stripped to stay within exams/)
  const safeFileName = fileName.replace(/[\\/]/g, '_');
  const fileKey = `exams/${courseId}/${safeFileName}`;

  try {
    const uploadUrl = await getUploadPresignedUrl(fileKey, fileType);

    return { status: 200, success: true, uploadUrl, fileKey };
  } catch (err: unknown) {
    return {
      status: 500,
      success: false,
      error: `Failed to generate upload URL: ${extractErrorMessage(err)}`,
    };
  }
}

interface ExamMetadataInput {
  courseName: string;
  courseId: string;
  year: number;
  semester: string;
  term: string;
  fileKey: string;
  uploader_id: string;
}

export async function saveExamMetadata(
  data: ExamMetadataInput,
): Promise<{ success: boolean; examId?: string; error?: string }> {
  const adminCheck = await requireAdmin();

  if (!adminCheck.ok) {
    return { success: false, error: adminCheck.error };
  }

  const { userId } = adminCheck;
  const supabase = await createClient();

  try {
    // Check for duplicate exam
    const { data: existingExam } = await supabase
      .from('exams')
      .select('id, file_key')
      .eq('course_id', data.courseId)
      .eq('year', data.year)
      .eq('semester', data.semester)
      .eq('term', data.term)
      .maybeSingle();

    if (existingExam) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('exams')
        .update({
          file_key: data.fileKey,
          uploader_id: userId,
          term: data.term,
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
        // Non-fatal: metadata update succeeded; old file cleanup can be retried manually
      }

      revalidatePath('/[majorId]/[courseId]', 'page');

      return { success: true, examId: existingExam.id };
    }

    // Insert new record
    const { data: insertedData, error } = await supabase
      .from('exams')
      .insert({
        name: data.courseName,
        course_id: data.courseId,
        year: data.year,
        semester: data.semester,
        term: data.term,
        file_key: data.fileKey,
        file_type: 'application/pdf',
        uploader_id: userId,
      })
      .select('id')
      .single();

    if (error) {
      // trigger catch block
      throw error; // Trigger catch block to rollback
    }

    revalidatePath('/exams');
    revalidatePath('/[majorId]/[courseId]', 'page');

    return { status: 200, success: true, examId: insertedData.id };
  } catch (err: unknown) {
    // Failed to save metadata — initiate rollback by deleting the orphaned file from R2
    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: data.fileKey,
      });
      await s3Client.send(command);
    } catch {
      // Rollback also failed — the file may be orphaned in R2 and will need manual cleanup
      return {
        success: false,
        error:
          'Failed to save exam details and could not revert the upload. Please contact support.',
      };
    }

    const reason = extractErrorMessage(err);

    return {
      status: 500,
      success: false,
      error: `Failed to save exam details. Upload reverted. (${reason})`,
    };
  }
}
