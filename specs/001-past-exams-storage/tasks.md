---
description: 'Task list for NTPU Past Exams Storage implementation'
---

# Tasks: NTPU Past Exams Storage

**Input**: Design documents from `/specs/001-past-exams-storage/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/upload-action.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install AWS SDK for Cloudflare R2 integration (`npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`)
- [x] T002 [P] Verify strict ESLint rules compliance per project constitution

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Execute Supabase database migration to create `exams` table in Supabase per `data-model.md`
- [x] T004 [P] Initialize server-side Supabase client utility in `lib/db/supabase.ts`
- [x] T005 [P] Initialize Cloudflare R2 S3 client utility in `lib/storage/r2.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Search and Download Past Exams (Priority: P1) 🎯 MVP

**Goal**: Students need to be able to find previous examinations for their courses to prepare for upcoming tests.

**Independent Test**: Can be fully tested by searching for an existing course and successfully downloading a PDF exam document.

### Implementation for User Story 1

- [x] T006 [P] [US1] Implement `getExams` database query function in `lib/db/exams.ts`
- [x] T007 [P] [US1] Implement presigned URL download generator function in `lib/storage/r2.ts`
- [x] T008 [US1] Create ExamSearch UI component in `app/components/exam/ExamSearch.tsx`
- [x] T009 [US1] Create ExamList UI component in `app/components/exam/ExamList.tsx`
- [x] T010 [US1] Build public exams page UI in `app/(public)/exams/page.tsx` integrating search and list components

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (requires manual data seeding).

---

## Phase 4: User Story 2 - Upload New Past Exams (Priority: P1)

**Goal**: Contributors or administrators need to upload new past exams to keep the repository up-to-date.

**Independent Test**: Can be fully tested by uploading a valid PDF document and verifying it appears in the system's database and object storage.

### Implementation for User Story 2

- [x] T011 [P] [US2] Implement `getPresignedUploadUrl` Server Action in `app/actions/upload-action.ts` per `contracts/upload-action.md`
- [x] T012 [P] [US2] Implement `saveExamMetadata` Server Action in `app/actions/upload-action.ts` (with rollback cleanup) per `contracts/upload-action.md`
- [x] T013 [US2] Create ExamUploadForm UI component in `app/components/exam/ExamUploadForm.tsx` (must enforce 10MB limit and PDF-only format client-side)
- [x] T014 [US2] Build protected upload page UI in `app/(protected)/upload/page.tsx` integrating the form and actions

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T015 Verify error states and edge case handling (upload failure cleanup, duplicate exams overwriting)
- [x] T016 Run quickstart.md validation locally to ensure system correctness end-to-end
- [x] T017 [US2] Modify courseId input field in ExamUploadForm to use a Select component fetching courses from the database
- [x] T018 [US2] Modify semester input field in ExamUploadForm to use a Select component with Spring and Fall options, defaulting to Spring
- [x] T019 [US2] Add Major select component to ExamUploadForm that fetches all majors from the database
- [x] T020 [US2] Update Course select in ExamUploadForm to filter by selected Major, include a search bar(with debounce and min 3 chars), and implement infinite scroll pagination (max 10 items per fetch)
- [x] T021 [US2] Review all database queries and ensure corresponding TypeScript interfaces/types exist in database.d.ts, adding them if missing
- [x] T022 [US2] Update Major Select in ExamUploadForm to use Autocomplete (searchable) and use major ID instead of code for state and course filtering
- [x] T023 [US2] Add `getAllMajors` and `getCoursesByMajorId` (with search + pagination) to `services/major-service.ts` and refactor `ExamUploadForm.tsx` to use them instead of inline Supabase queries

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3 & 4)**: All depend on Foundational phase completion
  - US1 and US2 can proceed in parallel once the foundation is complete.
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on US1, but integrates perfectly with it once both are complete.

### Parallel Opportunities

- All Setup tasks marked `[P]` can run in parallel
- `T004` and `T005` in the Foundational phase can run in parallel
- Data access functions (`T006`, `T007`) in US1 can be built in parallel.
- Server Actions (`T011`, `T012`) in US2 can be built in parallel.
- User Story 1 and User Story 2 can be developed entirely in parallel by different team members once Phase 2 is complete.

---

## Parallel Example: User Story 2

```bash
# Developer A builds the Server Actions:
Task: "Implement getPresignedUploadUrl Server Action in app/actions/upload-action.ts"
Task: "Implement saveExamMetadata Server Action in app/actions/upload-action.ts"

# Developer B builds the UI:
Task: "Create ExamUploadForm UI component in app/components/exam/ExamUploadForm.tsx"
Task: "Build protected upload page UI in app/(protected)/upload/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (Seed database manually to test)
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Foundation ready
2. Add User Story 1 (Search & Download) → Test independently → MVP!
3. Add User Story 2 (Upload) → Test independently → Feature Complete!
