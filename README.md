# Resume Optimizer (Frontend)

Modern React + Vite frontend for the Resume Optimizer experience. Users can upload or paste a resume, add a job description, pick content languages, and receive an optimized resume with insights.

**Highlights**
- Resume upload with PDF/DOCX/TXT support
- Multi‑language workflow: resume language, job description language, desired output language
- Optimization queue with results view
- Export report to CSV/TXT
- Demo/mock mode for screenshots and local UI work

**Tech Stack**
- React + TypeScript + Vite
- Tailwind CSS
- Supabase auth
- REST API for jobs and uploads

## Quick Start

1. Install dependencies  
   `npm install`
2. Create `.env.local` with required values (see below).
3. Run the dev server  
   `npm run dev`

## Environment Variables

Create `resume-optimizer-arab/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DEMO_MODE=false
VITE_USE_JOB_MOCKS=false
```

Notes:
- `VITE_API_BASE_URL` should point to the API gateway.
- `VITE_DEMO_MODE=true` forces demo UI states and mock data.
- `VITE_USE_JOB_MOCKS=true` uses local mock data even if the API is available.

## Scripts

- `npm run dev` starts the dev server.
- `npm run build` produces a production build.
- `npm run preview` serves the production build locally.
- `npm run lint` runs linting (if configured).

## API Expectations

The frontend expects these routes on the API gateway:
- `POST /jobs` create an optimization job
- `GET /jobs` list jobs for the current user
- `GET /jobs/:id` get job details and result
- `POST /jobs/:id/refine` refine the optimized resume
- `POST /resumes/upload` extract text from a PDF/DOCX/TXT upload

The job payload includes:
- `resumeText`, `jobDescription`, `customInstructions`
- `resumeLang`, `jdLang`, `desiredOutputLang`

## Folder Map

- `pages/` page containers and app view logic
- `components/` UI components
- `services/` API and Supabase clients
- `translations.ts` localized strings for EN/AR
- `config.ts` environment configuration

## Common Issues

- If file uploads fail, confirm the gateway and parser services are running.
- If results never complete, check the orchestrator worker logs.
- If output language is wrong, verify `desiredOutputLang` and backend prompt handling.
