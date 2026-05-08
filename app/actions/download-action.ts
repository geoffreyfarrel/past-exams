'use server';

import { getDownloadPresignedUrl } from '@/lib/storage/r2';

export async function getDownloadUrl(
  fileKey: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const url = await getDownloadPresignedUrl(fileKey);

    return { success: true, url };
  } catch {
    // error

    return { success: false, error: 'Failed to generate download link' };
  }
}
