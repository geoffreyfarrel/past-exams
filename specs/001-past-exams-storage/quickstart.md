# Quickstart: NTPU Past Exams Storage

## Setup Dependencies
Ensure your environment variables are configured for Supabase and Cloudflare R2:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_ENDPOINT=...
```

## Database Migration
Execute the SQL migration to create the `exams` table in Supabase. The migration script should create the table defined in `data-model.md`.

## Running Locally
1. Run `npm install`
2. Run `npm run dev`
3. Navigate to `/exams` to view the search interface.
4. Log in and navigate to `/upload` to test the upload flow (ensure you use a PDF < 10MB).
