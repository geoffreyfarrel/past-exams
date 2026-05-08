# Interface Contract: Exam Upload Server Actions

## `getPresignedUploadUrl(fileName: string, fileType: string, fileSize: number)`
Generates a presigned URL for direct client-to-R2 upload.

**Request Requirements:**
- Authenticated user session.
- `fileType` MUST be `application/pdf`.
- `fileSize` MUST be <= 10MB (10485760 bytes).

**Response:**
```typescript
{
  success: boolean;
  uploadUrl?: string;
  fileKey?: string;
  error?: string;
}
```

## `saveExamMetadata(data: ExamMetadataInput)`
Saves the exam metadata to Supabase. Must be called immediately after successful R2 upload.

**Request Requirements:**
- Authenticated user session.
```typescript
interface ExamMetadataInput {
  courseId: string;
  year: number;
  semester: string;
  professorName: string;
  fileKey: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  examId?: string;
  error?: string;
}
```
**Failure Behavior**: If saving to Supabase fails, the action will internally attempt to delete `fileKey` from R2 to prevent orphaned files.
