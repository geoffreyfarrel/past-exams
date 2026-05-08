# Phase 0: Research & Architecture

## 1. Object Storage Integration (Cloudflare R2)
- **Decision**: Use AWS SDK for JavaScript v3 (`@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`) to interface with Cloudflare R2.
- **Rationale**: Cloudflare R2 provides an S3-compatible API. Using the official AWS SDK is the industry standard, ensuring robustness and support for presigned URLs. Presigned URLs will be used for both direct uploads from the client (to save server bandwidth) and secure downloads.
- **Alternatives**: Cloudflare's specific workers (too complex, unnecessary for NextJS API routes).

## 2. Supabase Integration
- **Decision**: Use `@supabase/ssr` for server-side auth checks and database interactions.
- **Rationale**: The project already relies on `@supabase/ssr` per `package.json`. It securely handles auth tokens in Next.js Server Components and Server Actions.

## 3. Upload Flow
- **Decision**: Client requests a presigned URL from Next.js Server Action -> Client uploads directly to R2 -> Client calls Next.js Server Action to save metadata to Supabase. If the Supabase save fails, the Server Action invokes an R2 delete command to clean up the orphaned file.
- **Rationale**: Direct-to-R2 upload is faster and bypasses Next.js server limits (e.g., Vercel's 4.5MB limit for serverless functions). It correctly enforces the transaction-like cleanup constraint required by the spec.
