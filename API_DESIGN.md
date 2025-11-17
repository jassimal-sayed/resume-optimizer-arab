# API Design – Resume Optimizer

This document defines the frontend-facing API contract for the Resume Optimizer experience. The backend can be implemented in a different repository, but it **must** honor these shapes so the current UI can swap from mock data to live calls without churn.

## Overview

- REST JSON API, rooted at `API_BASE_URL` (configured through `VITE_API_BASE_URL`).
- All endpoints require an authenticated Supabase user session; pass the Supabase `access_token` in the `Authorization: Bearer <token>` header.
- Unless stated otherwise, responses wrap their payload in a `{ data, error }` envelope so the frontend can handle failures consistently.

## Job Schema

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` (ULID/UUID) | Primary identifier. |
| `user_id` | `string` | Owner; must match Supabase auth user. |
| `title` | `string` | Human-friendly label shown in the queue. |
| `company` | `string \| null` | Optional company/organization. |
| `resume_text` | `string` | Original resume body (plaintext or markdown). |
| `job_description` | `string` | Original job description. |
| `custom_instructions` | `string \| null` | Optional user refinement instructions during creation. |
| `resume_lang` | `'en' \| 'ar'` | Language of resume as provided/selected by user. |
| `jd_lang` | `'en' \| 'ar'` | Language of job description. |
| `desired_output_lang` | `'en' \| 'ar'` | Output language preference (defaults to `resume_lang`). |
| `status` | `'queued' \| 'processing' \| 'complete' \| 'failed'` | Indicates lifecycle stage. |
| `result` | `JobResult \| null` | Populated when `status === 'complete'`. |
| `created_at` | ISO 8601 string | Creation timestamp. |
| `updated_at` | ISO 8601 string | Last update timestamp. |

### `JobResult`

Matches the existing UI structure:

```ts
interface JobResult {
  id: string;
  score: number;
  missingKeywords: string[];
  coveredKeywords: string[];
  changeLog: string[];
  previewMarkdown: string;
  detectedResumeLang: 'en' | 'ar';
  detectedJobDescLang: 'en' | 'ar';
}
```

### Language Metadata Requirements

1. The backend **must** persist `resume_lang`, `jd_lang`, and `desired_output_lang` from the payload.
2. Backend detection results may differ from user selection. Include `detectedResumeLang` and `detectedJobDescLang` in the `result` so the UI can highlight mismatches.
3. Refinements should inherit the job’s original language metadata unless explicitly overridden in the request body.

## Endpoints

### `POST /jobs` – Create Job

Creates a new optimization request and queues it for processing.

#### Request Body

```json
{
  "title": "Senior Frontend Engineer",
  "company": "NoorTech",
  "resume_text": "....",
  "job_description": "....",
  "custom_instructions": "Highlight platform launches",
  "resume_lang": "en",
  "jd_lang": "en",
  "desired_output_lang": "ar"
}
```

- `title` optional; backend should derive from `job_description` if omitted.
- `custom_instructions` may be empty; store as `null`.

#### Response

```json
{
  "data": {
    "job": {
      "id": "job_01J8F...",
      "status": "queued",
      "title": "Senior Frontend Engineer",
      "company": "NoorTech",
      "resume_lang": "en",
      "jd_lang": "en",
      "desired_output_lang": "ar",
      "created_at": "2024-07-01T12:00:00Z",
      "updated_at": "2024-07-01T12:00:00Z"
    }
  },
  "error": null
}
```

Errors use HTTP >= 400 plus `{ error: { code, message } }`.

### `GET /jobs` – List Jobs

Returns jobs for the authenticated user, ordered by `created_at desc`.

#### Query Params

- `status` (optional): filter by job status.
- `limit`/`offset` (optional) for pagination.

#### Response

```json
{
  "data": {
    "jobs": [
      {
        "id": "job_01J8F...",
        "title": "Senior Frontend Engineer",
        "company": "NoorTech",
        "status": "complete",
        "resume_lang": "en",
        "jd_lang": "en",
        "desired_output_lang": "ar",
        "created_at": "2024-07-01T12:00:00Z",
        "updated_at": "2024-07-01T12:05:12Z",
        "result": { /* JobResult */ }
      }
    ]
  },
  "error": null
}
```

### `GET /jobs/:id` – Job Details

Fetches a single job, including latest `result`.

#### Response

```json
{
  "data": {
    "job": {
      "id": "job_01J8F...",
      "user_id": "user_123",
      "title": "Senior Frontend Engineer",
      "company": "NoorTech",
      "resume_text": "....",
      "job_description": "....",
      "custom_instructions": "....",
      "resume_lang": "en",
      "jd_lang": "en",
      "desired_output_lang": "ar",
      "status": "complete",
      "result": {
        "id": "opt_job_01J8F...",
        "score": 88,
        "missingKeywords": ["Agile"],
        "coveredKeywords": ["React"],
        "changeLog": ["Updated summary..."],
        "previewMarkdown": "# ...",
        "detectedResumeLang": "en",
        "detectedJobDescLang": "en"
      },
      "created_at": "2024-07-01T12:00:00Z",
      "updated_at": "2024-07-01T12:05:12Z"
    }
  },
  "error": null
}
```

### `POST /jobs/:id/refine` – Refine Job

Creates a refinement request for an existing job. The backend may create a new result record linked to the original job.

#### Request Body

```json
{
  "instructions": "Make the tone more formal and prioritize Arabic sections.",
  "desired_output_lang": "ar" // optional override
}
```

If `desired_output_lang` is omitted, reuse the job’s current preference.

#### Response

```json
{
  "data": {
    "job": {
      "id": "job_01J8F...",
      "status": "processing",
      "updated_at": "2024-07-01T12:10:00Z"
    }
  },
  "error": null
}
```

Once the refinement completes, `GET /jobs/:id` will show the updated `result`.

## Error Handling

- All error responses follow `{ error: { code: string; message: string; details?: Record<string, unknown> } }`.
- Use specific HTTP status codes:
  - `400` validation errors (missing languages, empty instructions, etc.).
  - `401` unauthenticated.
  - `403` when accessing another user’s job.
  - `404` when job is missing.
  - `429` rate limits.
  - `500` server failures.

## TypeScript Mapping

The frontend will mirror these contracts in `types.ts`. Future API client modules (`services/jobs.ts`) should import the shared types to ensure compile-time safety when the mocked data is replaced with live requests.
