import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { s3Client } from '@/utils/r2';

export async function getDownloadPresignedUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileKey,
  });

  // URL expires in 1 hour
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getUploadPresignedUrl(fileKey: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileKey,
    ContentType: contentType,
  });

  // URL expires in 15 minutes
  return getSignedUrl(s3Client, command, { expiresIn: 900 });
}
