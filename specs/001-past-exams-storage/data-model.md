# Data Model: Past Exams Storage

## Entities

### `exams` (Supabase Table)

Stores the metadata for uploaded past examinations.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Primary Key, Default: `uuid_generate_v4()` | Unique identifier for the exam |
| `course_id` | String | Not Null | Identifier/Name of the course |
| `year` | Integer | Not Null | Academic year of the exam |
| `semester` | String | Not Null | Semester (e.g., 'Fall', 'Spring') |
| `professor_name` | String | Not Null | Name of the instructing professor |
| `file_key` | String | Not Null, Unique | Object key for the PDF file in Cloudflare R2 |
| `uploaded_by` | UUID | Not Null, Foreign Key to `auth.users` | User who uploaded the file |
| `created_at` | Timestamp | Not Null, Default: `now()` | Record creation timestamp |

## State Transitions
- **Upload Initialized**: Client requests presigned URL.
- **File Uploaded**: File exists in R2 (orphaned state).
- **Metadata Saved**: Record inserted into `exams`. File is now officially active.
- **Upload Failed**: File exists in R2, metadata fails. System attempts deletion of `file_key` from R2.
