# Feature Specification: NTPU Past Exams Storage

**Feature Branch**: `001-past-exams-storage`  
**Created**: 2026-05-08  
**Status**: Draft  
**Input**: User description: "Follow the techstack used in this repo. Mainly NextJS as fullstack, and use Supabase as db. Need to use a model for the supabase data. This website serves as a place to store previous examination from NTPU. The exams is stored in only pdf formats. The pdf will be stored in r2 cloudflare storage and the file-key is stored in supabase."

## Clarifications

### Session 2026-05-08

- Q: Is the upload functionality restricted to authenticated users, or can anyone upload a past exam? → A: Authenticated users only
- Q: How should the system handle duplicate exams? → A: Overwrite/replace the existing exam
- Q: What is the maximum allowed file size for an uploaded PDF exam? → A: 10MB limit
- Q: Which metadata fields MUST be provided when a user uploads a new past exam? → A: Course ID, Year, Semester, and Professor Name
- Q: How should the system handle a scenario where the file upload succeeds but saving metadata fails? → A: Immediately attempt to delete the orphaned file from object storage

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search and Download Past Exams (Priority: P1)

Students need to be able to find previous examinations for their courses to prepare for upcoming tests.

**Why this priority**: Retrieving and studying from past exams is the primary value proposition of the platform for the majority of users.

**Independent Test**: Can be fully tested by searching for an existing course and successfully downloading a PDF exam document.

**Acceptance Scenarios**:

1. **Given** a populated database of past exams, **When** a user searches for a specific course, **Then** the system displays a list of available past exams.
2. **Given** a list of past exams, **When** a user clicks on an exam, **Then** the user is able to view or download the PDF document.

---

### User Story 2 - Upload New Past Exams (Priority: P1)

Contributors or administrators need to upload new past exams to keep the repository up-to-date.

**Why this priority**: Without the ability to upload new content, the repository will become stagnant and lose value over time.

**Independent Test**: Can be fully tested by uploading a valid PDF document and verifying it appears in the system's database and object storage.

**Acceptance Scenarios**:

1. **Given** a user has a valid PDF exam, **When** they upload it and provide required metadata (e.g., course, year), **Then** the system successfully saves the document and makes it available for others.
2. **Given** a user tries to upload a non-PDF file, **When** they submit the form, **Then** the system rejects the upload with a clear error message.

---

### Edge Cases

- If a user attempts to upload a file exceeding the 10MB limit, the system will reject the upload with a clear error message.
- If the file upload to object storage succeeds but saving metadata to the database fails, the system will immediately attempt to delete the orphaned file from object storage.
- If two identical exams (same course, same year, same professor) are uploaded, the system will overwrite/replace the existing exam with the new upload.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to upload examination documents. Unauthenticated users cannot upload.
- **FR-002**: System MUST restrict uploaded files to PDF format exclusively.
- **FR-003**: System MUST securely store the uploaded PDFs in an object storage platform.
- **FR-004**: System MUST store metadata (Course ID, Year, Semester, Professor Name, and storage file-key) for each exam in the primary database.
- **FR-005**: System MUST allow users to browse and search for past examinations based on metadata.
- **FR-006**: System MUST allow users to retrieve (view or download) the PDF documents.
- **FR-007**: System MUST restrict uploaded files to a maximum size of 10MB.

### Key Entities

- **Exam Document**: Represents the physical PDF file stored in object storage.
- **Exam Metadata**: Represents the database record linking the physical file (via file-key) to its academic context (Course ID, Year, Semester, and Professor Name).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of successfully uploaded documents are stored in the object storage and retrievable via the system.
- **SC-002**: System strictly rejects 100% of any non-PDF file formats during the upload process.
- **SC-003**: Users can successfully locate and begin downloading a desired exam in under 1 minute from the homepage.
- **SC-004**: File uploads complete successfully without orphaned files (files in storage without a database record) in 99.9% of cases.

## Assumptions

- The system will be built using the project's existing NextJS fullstack architecture.
- Cloudflare R2 will be utilized as the object storage platform for hosting the PDF files.
- Supabase will be used as the primary database for storing exam metadata and the R2 file-keys.
- The user interface will align with the existing responsive design and component library (shadcn/heroui) standards set in the project constitution.
