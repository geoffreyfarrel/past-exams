# Implementation Plan: NTPU Past Exams Storage

**Branch**: `feature/past-exams-storage` | **Date**: 2026-05-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-past-exams-storage/spec.md`

## Summary

The feature provides a centralized storage system for NTPU past examinations. Authenticated users can upload past exams (strictly PDF, max 10MB) to Cloudflare R2, while the associated metadata (Course ID, Year, Semester, Professor Name) is stored in Supabase. All users can search, browse, and download these exams.

## Technical Context

**Language/Version**: TypeScript, Next.js (App Router)
**Primary Dependencies**: `@supabase/ssr`, `@supabase/supabase-js`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `@heroui/react`
**Storage**: Supabase (PostgreSQL) for metadata, Cloudflare R2 for object storage
**Testing**: N/A (no testing framework specified in repo)
**Target Platform**: Responsive Web Browser
**Project Type**: Fullstack Web Application
**Performance Goals**: Sub-minute exam retrieval and download
**Constraints**: 10MB max file size, PDF format only, authenticated upload only
**Scale/Scope**: University student body

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] UI/UX Alignment: Does the UI plan use `shadcn`/`heroui` and account for responsive design? (Yes)
- [x] Dependency Review: Are all proposed new libraries community standards, or have they been justified/consulted on? (Yes, AWS SDK for S3/R2)
- [x] Code Quality: Does the plan account for strict ESLint compliance? (Yes)

## Project Structure

### Documentation (this feature)

```text
specs/001-past-exams-storage/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── upload-action.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
app/
├── components/
│   └── exam/
│       ├── ExamUploadForm.tsx
│       ├── ExamList.tsx
│       └── ExamSearch.tsx
├── (public)/
│   └── exams/
│       └── page.tsx     # Exam search and listing
├── (protected)/
│   └── upload/
│       └── page.tsx     # Upload interface
lib/
├── db/
│   └── exams.ts         # Supabase data access
└── storage/
    └── r2.ts            # Cloudflare R2 client
```

**Structure Decision**: Integrated directly into the existing Next.js App Router structure. UI components in `app/components/exam`, routes split by authentication requirements.
