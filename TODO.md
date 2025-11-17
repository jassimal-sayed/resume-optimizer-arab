# AI IMPLEMENTATION TODOs – RESUME OPTIMIZER (EN/AR)

This file defines a **sequenced, implementation‑ready task list** for AI agents working on this repository.

Conventions for agents:

- Work on **one task at a time**.
- Do **not** change scope of a task; if something is missing, add a new task instead of expanding an existing one.
- Always read the **“Dependencies”** section before starting a task.
- When a task is finished, update its status marker from `[ ]` to `[x]` and briefly summarize changes under **“Completion Notes”**.

Status markers:

- `[ ]` = not started
- `[~]` = in progress
- `[x]` = completed

---

## Phase 1 – Core Arabic Support & UX Structure

### Task 1 – Global Language Toggle & Context

- **ID:** T1
- **Status:** [x]
- **Priority:** High
- **Goal:** Add a global language system (English / Arabic) that other components can consume to render correct copy, layout direction, and labels.
- **Details:**
  - Introduce a `LanguageContext` (or equivalent) that holds:
    - `language`: `'en' | 'ar'`
    - updater function, e.g. `setLanguage`
  - Persist language selection in `localStorage` so it survives reloads.
  - Wrap the app root (`App.tsx`) with this context provider.
  - Ensure the selected language is easily consumable in:
    - `components/layout/Navbar.tsx`
    - `components/OptimizationForm.tsx`
    - `components/ResultsView.tsx`
  - Do **not** add business logic here (no translation of content yet); just plumbing.
- **Affected files:** `App.tsx`, `components/layout/Navbar.tsx`, new `contexts/LanguageContext.tsx` (or similar).
- **Dependencies:** None.
- **Completion Notes:** Added `contexts/LanguageContext.tsx` with persistence and wrapped `AppPage` in `LanguageProvider` via `App.tsx` so any component can read/update the language.

---

### Task 2 – Navbar Language Switch UI

- **ID:** T2
- **Status:** [x]
- **Priority:** High
- **Goal:** Provide a clear language switch in the navbar so users can toggle between English and Arabic.
- **Details:**
  - In `components/layout/Navbar.tsx`, add a visible toggle on the right side, e.g. `EN | العربية`.
  - Use `LanguageContext` from **T1** to:
    - Highlight the active language.
    - Update the current language when the user clicks.
  - Ensure the toggle is keyboard accessible and has visible focus styles.
  - Do not yet flip layout or text direction; that is handled in a later task.
- **Affected files:** `components/layout/Navbar.tsx`, `contexts/LanguageContext.tsx` (or equivalent).
- **Dependencies:** T1.
- **Completion Notes:** Navbar now consumes `useLanguage` and renders an accessible EN/العربية pill toggle that updates the active language.

---

### Task 3 – RTL Layout & Direction Handling

- **ID:** T3
- **Status:** [x]
- **Priority:** High
- **Goal:** When Arabic is selected, the UI should use RTL direction and right‑aligned content where appropriate.
- **Details:**
  - At the top‑level container (e.g. in `App.tsx` or `pages/AppPage.tsx`), set:
    - `dir={language === 'ar' ? 'rtl' : 'ltr'}`
    - Conditional Tailwind classes to flip alignment (e.g. `text-right` vs `text-left`).
  - In `Navbar`:
    - When `language === 'ar'`, render logo on the right and user email / actions on the left.
  - Ensure `ResultsView` preview can render Arabic correctly:
    - When Arabic is selected, set `dir="rtl"` and right‑align the markdown container.
  - Avoid duplicating markup; prefer conditional class names.
- **Affected files:** `App.tsx`, `pages/AppPage.tsx`, `components/layout/Navbar.tsx`, `components/ResultsView.tsx`.
- **Dependencies:** T1, T2.
- **Completion Notes:** `AppPage` root now sets `dir` + alignment based on language, `Navbar` flips layout/logo/actions for Arabic, and `ResultsView`/resume preview render RTL text with proper direction.

---

### Task 4 – Localized UI Copy & Placeholders (EN/AR)

- **ID:** T4
- **Status:** [x]
- **Priority:** High
- **Goal:** Localize visible UI strings to English and Arabic, including placeholders and button text.
- **Details:**
  - Create a simple in‑code translation map, e.g. `translations.ts`:
    - Structure: `translations[language].labelKey`.
  - Replace hard‑coded strings in:
    - `components/OptimizationForm.tsx`
    - `components/ResultsView.tsx`
    - `components/layout/Navbar.tsx`
    - `components/JobsQueue.tsx`
  - Include **Arabic placeholder examples**, especially:
    - Resume text placeholder.
    - Job description placeholder.
    - Custom instructions / refinement text.
  - Replace generic text `Analyze & Optimize` with localized, more natural phrases (e.g. “Tailor my CV to this job” / Arabic equivalent).
- **Affected files:** `components/OptimizationForm.tsx`, `components/ResultsView.tsx`, `components/layout/Navbar.tsx`, `components/JobsQueue.tsx`, new `translations.ts`.
- **Dependencies:** T1.
- **Completion Notes:** Added `translations.ts` + `useTranslations` hook, localized Navbar, OptimizationForm, ResultsView, JobsQueue, placeholders, errors, and CTA copy for both EN/AR.

---

### Task 5 – Per‑Resume Content Language Selector

- **ID:** T5
- **Status:** [x]
- **Priority:** High
- **Goal:** Let users specify the language of the resume/job content per optimization job.
- **Details:**
  - In `components/OptimizationForm.tsx`:
    - Add a “Content Language” selector (e.g. dropdown or segmented control).
    - Values: `'en'` (English), `'ar'` (Arabic), possibly “Auto detect” for future backend work.
  - Include also:
    - “Job Title” input.
    - “Company / Organization” input.
  - Return these new fields in `onStartOptimization` payload so downstream logic can use them.
  - When content language is Arabic:
    - Apply `dir="rtl"` and right‑alignment to the relevant textareas.
  - Keep validation messages localized using `translations`.
- **Affected files:** `components/OptimizationForm.tsx`, `pages/AppPage.tsx` (to handle new payload fields).
- **Dependencies:** T1, T4.
- **Completion Notes:** Optimization form now adds content language toggle + job title + company fields, passes them through to AppPage job creation, applies RTL to text areas per content language, and stores metadata for queue rendering.

---

### Task 6 – Stepper / Journey Indicator

- **ID:** T6
- **Status:** [x]
- **Priority:** High
- **Goal:** Make the flow “Input → Processing → Results → Refine” explicit and visible across relevant views.
- **Details:**
  - Create a reusable `StepIndicator` component that:
    - Receives current step (`'input' | 'processing' | 'results' | 'refine'`).
    - Renders numbered steps with labels (localized).
  - Integrate `StepIndicator` at the top of:
    - Dashboard / form view (current step: `input`).
    - Queue / processing view (current step: `processing`).
    - Results view (current step: `results` or `refine` if the refinement panel is active).
  - On `ResultsView` specifically:
    - Add visible labels like “Step 3 of 4 – Optimization Results” and “Step 4 of 4 – Refine with AI” using the step indicator or nearby text.
- **Affected files:** new `components/StepIndicator.tsx`, `pages/AppPage.tsx`, `components/ResultsView.tsx`, `components/JobsQueue.tsx`.
- **Dependencies:** T1, T4.
- **Completion Notes:** Added `components/StepIndicator` with localized labels, wired it into dashboard/queue/results views, and labeled the results/refine panels with the appropriate “Step 3/4” copy.

---

## Phase 2 – Queue Behavior & Demo/Production Separation

### Task 7 – Replace DevPreviewControls with Real Flow

- **ID:** T7
- **Status:** [x]
- **Priority:** High
- **Goal:** Remove interactive “Developer Preview Controls” from the production flow and rely on real navigation driven by job state.
- **Details:**
  - In `pages/AppPage.tsx`, isolate `DevPreviewControls` and `previewState` into a **development‑only** path.
    - Use an environment flag, e.g. `import.meta.env.VITE_DEMO_MODE === 'true'`.
  - For production mode:
    - Do **not** render `DevPreviewControls`.
    - Do **not** use `previewState` to switch screens.
    - Navigation should be:
      - User submits form → new job with `status='processing'` added.
      - UI automatically shows the queue view with that job highlighted.
      - When job is complete, user can click the job row to open the results view.
  - Ensure demo mode still works for screenshots, but is fully decoupled from production logic.
- **Affected files:** `pages/AppPage.tsx`.
- **Dependencies:** T6 (for consistent step display).
- **Completion Notes:** Added `VITE_DEMO_MODE` guard so preview controls/rendering only show in demo builds; production flow now always uses real form → queue → results transitions without mocked navigation.

---

### Task 8 – Production-Ready Job State & Navigation

- **ID:** T8
- **Status:** [x]
- **Priority:** High
- **Goal:** Align frontend behavior with the intended model: job starts in background, user sees queue with status updates, then opens results.
- **Details:**
  - In `pages/AppPage.tsx`:
    - On `handleStartOptimization`, after creating the job, navigate UI to a “queue” view:
      - This could be via internal state `currentView: 'dashboard' | 'queue' | 'results'`.
    - Show `JobsQueue` prominently in this view with the new job at the top.
  - When a job’s `status` changes to `'complete'`, allow clicking it to:
    - Set `selectedJobId`.
    - Switch `currentView` to `results`.
  - Ensure the “Back to Dashboard” button in `ResultsView` takes the user back to the main dashboard (form + queue), not to any dev preview.
- **Affected files:** `pages/AppPage.tsx`, `components/JobsQueue.tsx`, `components/ResultsView.tsx`.
- **Dependencies:** T7.
- **Completion Notes:** Added `appView` state that automatically shifts to queue on job start, results when selecting a job, and back to dashboard on exit; demo preview controls now gated by `VITE_DEMO_MODE` while production navigation follows the real queue/results flow.

---

### Task 9 – Extract Presentational Components for Job Row & Results Layout

- **ID:** T9
- **Status:** [x]
- **Priority:** Medium
- **Goal:** Separate purely visual components from data/logic so they can be reused with either mock or real backend data.
- **Details:**
  - From `components/JobsQueue.tsx`, extract a `JobListItem` presentational component that:
    - Receives `job` and `onClick` props.
    - Handles rendering text, status pill, and accessibility (focus/role).
  - From `components/ResultsView.tsx`, extract:
    - `ResultsSummaryPanel` (score, keyword analysis, change log).
    - `ResumePreviewPanel` (markdown preview + copy button).
  - Keep data fetching and navigation logic in container components (`AppPage`, `ResultsView` parent logic).
  - Make sure extracted components accept props that are backend‑agnostic (`JobQueueItem`, `OptimizationResult`).
- **Affected files:** `components/JobsQueue.tsx`, `components/ResultsView.tsx`, new components in `components/` as needed.
- **Dependencies:** T8.
- **Completion Notes:** Added `JobListItem`, `ResultsSummaryPanel`, and `ResumePreviewPanel` components and refactored `JobsQueue` + `ResultsView` to consume them for cleaner presentation-only logic.

---

## Phase 3 – UI & Accessibility Enhancements

### Task 10 – Dashboard & Results Visual Hierarchy

- **ID:** T10
- **Status:** [x]
- **Priority:** Medium
- **Goal:** Make the main form or “Your Applications” list the primary focus on the dashboard, and make the optimized resume preview the main focus on the results page.
- **Details:**
  - On dashboard:
    - Remove or demote `DevPreviewControls` (already handled by T7).
    - Ensure the form card is visually dominant (positioned higher, maybe slightly larger than queue).
  - On results (`components/ResultsView.tsx`):
    - Ensure the right‑hand preview (`md:col-span-3`) visually dominates.
    - Make supporting info (score, keywords, change log) visually secondary.
- **Affected files:** `pages/AppPage.tsx`, `components/ResultsView.tsx`.
- **Dependencies:** T7, T8.
- **Completion Notes:** Restructured `AppPage` to emphasize the form with a sticky queue panel and added clearer queue status messaging; `ResultsView` now presents the preview as the hero section with analysis secondary.

---

### Task 11 – Collapsible Detailed Analysis Panel

- **ID:** T11
- **Status:** [x]
- **Priority:** Medium
- **Goal:** Hide keyword analysis and change log behind a toggle so the optimized resume preview remains the main focus.
- **Details:**
  - In `ResultsView` (or extracted `ResultsSummaryPanel` from T9):
    - Add a button or disclosure component above the preview: e.g. “View detailed match analysis”.
    - When expanded, show:
      - Overall Match Score.
      - Keyword pills.
      - Change log.
    - When collapsed, show only a concise summary (e.g., “Match score: 88%”).
  - Ensure the toggle is keyboard accessible and fully localized.
- **Affected files:** `components/ResultsView.tsx` and any extracted summary component.
- **Dependencies:** T9, T4.
- **Completion Notes:** Introduced localized show/hide toggle so the detailed analysis (score/keywords/change log) collapses above the preview to keep focus on the optimized document.

---

### Task 12 – Mobile Responsiveness Improvements

- **ID:** T12
- **Status:** [x]
- **Priority:** Medium
- **Goal:** Ensure forms and results are comfortable to use on small screens.
- **Details:**
  - `components/ui/Card.tsx`:
    - Change padding to `p-4 sm:p-6` (or similar) to reduce padding on small screens.
  - `components/OptimizationForm.tsx`:
    - Consider reducing `rows` on textareas for small screens or limit height via Tailwind classes (e.g., `max-h-60`).
    - Make sure the form doesn’t feel taller than necessary on mobile.
  - `components/ResultsView.tsx`:
    - Verify single column layout on small screens is usable.
    - Ensure the preview’s `max-h-[60vh]` still makes sense; adjust if necessary for smaller devices.
- **Affected files:** `components/ui/Card.tsx`, `components/OptimizationForm.tsx`, `components/ResultsView.tsx`.
- **Dependencies:** None (can be done in parallel with others).
- **Completion Notes:** Reduced card padding (`p-4 sm:p-6`) and constrained form textareas with responsive min-heights so the layout feels comfortable on phones while keeping the results preview unchanged.

---

### Task 13 – Accessibility & Focus States

- **ID:** T13
- **Status:** [x]
- **Priority:** Medium
- **Goal:** Improve keyboard navigation and color contrast, especially in dark mode.
- **Details:**
  - In `components/JobsQueue.tsx`:
    - Ensure each job row is reachable via keyboard and has a visible focus outline (e.g. `focus:ring-2 focus:ring-primary-500`).
  - Review buttons (`components/ui/Button.tsx`) and toggles:
    - Confirm sufficient contrast and visible focus rings.
  - Adjust text colors (e.g. `text-slate-400` on `bg-gray-800`) to meet WCAG contrast by slightly lightening text or background.
  - Test the queue and results screens using keyboard only.
- **Affected files:** `components/JobsQueue.tsx`, `components/ui/Button.tsx`, other components using low‑contrast text.
- **Dependencies:** None.
- **Completion Notes:** (to be filled by agent)

---

### Task 14 – Refinement UX Quick Actions

- **ID:** T14
- **Status:** [x]
- **Priority:** Low
- **Goal:** Make it easier for users to refine results by adding quick-action chips that prefill refinement instructions.
- **Details:**
  - In `components/ResultsView.tsx` (refinement form):
    - Add a small set of clickable chips (buttons) above the textarea:
      - Examples: “More formal”, “Shorter”, “More technical”, “Arabic-first CV”.
    - When a chip is clicked:
      - Either append a phrase to the textarea or replace its content (decide and document).
  - Localize chip labels via the translation system (`translations.ts`).
- **Affected files:** `components/ResultsView.tsx`, `translations.ts`.
- **Dependencies:** T4.
- **Completion Notes:** Added localized quick-action chips that append preset refinement instructions to the textarea when clicked, with helper text describing the behavior.

---

## Phase 4 – Backend & Architecture

### Task 15 – Config & Environment Management

- **ID:** T15
- **Status:** [x]
- **Priority:** Low
- **Goal:** Move hard-coded API URLs and Supabase configuration into environment-based configuration suitable for production.
- **Details:**
  - In `config.ts`:
    - Replace hard‑coded `API_BASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` with values from Vite env (`import.meta.env.VITE_*`).
    - Provide sensible fallbacks for local development if necessary, but avoid shipping real secrets.
  - Confirm `services/supabase.ts` imports updated constants and logs helpful errors when missing.
- **Affected files:** `config.ts`, `services/supabase.ts`.
- **Dependencies:** None.
- **Completion Notes:** Config now pulls API/Supabase values from `import.meta.env` with localhost fallbacks, and the Supabase client logs a clear error when env vars are missing.

---

### Task 16 – Backend Job Model & API Contracts (Design Only in Frontend Repo)

- **ID:** T16
- **Status:** [x]
- **Priority:** High
- **Goal:** Define the job model and API contracts that the frontend will rely on, even if backend implementation is in a different repo.
- **Details:**
  - Document (in a markdown file, e.g. `API_DESIGN.md`) the intended endpoints:
    - `POST /jobs` – create job.
    - `GET /jobs` – list jobs for current user.
    - `GET /jobs/:id` – get details + result.
    - `POST /jobs/:id/refine` – refine an existing job.
  - Specify job schema fields:
    - `id`, `user_id`, `title`, `company`, `resume_lang`, `jd_lang`, `status`, `created_at`, `updated_at`, and any fields for original texts and results.
  - Describe expected response shapes so TypeScript types can be created.
  - Include language metadata requirements (for Arabic/English processing).
- **Affected files:** new `API_DESIGN.md`, `types.ts` (for future interfaces).
- **Dependencies:** T5 (language fields), T1.
- **Completion Notes:** Added `API_DESIGN.md` with job schema/endpoints and expanded `types.ts` with Job/Result payloads, statuses, and language metadata.

---

### Task 17 – Frontend Integration with Job API (Stubbed)

- **ID:** T17
- **Status:** [x]
- **Priority:** High
- **Goal:** Refactor `pages/AppPage.tsx` to use async API calls for creating and retrieving jobs, while still allowing mock/stubbed implementations during early development.
- **Details:**
  - Introduce a `jobsService` module (e.g. `services/jobs.ts`) with functions:
    - `createJob(payload)`, `listJobs()`, `getJob(id)`, `refineJob(id, instructions)`.
  - Replace in‑component mock logic in `handleStartOptimization` and `handleRefine` with calls to this service.
  - For now, the service can:
    - Call real backend if env vars are present, or
    - Fall back to in‑memory/mock implementations (similar to current behavior) if not.
  - Preserve the user experience: job appears in queue quickly and updates status when result is ready.
- **Affected files:** `pages/AppPage.tsx`, new `services/jobs.ts`, possibly `types.ts`.
- **Dependencies:** T16, T8.
- **Completion Notes:** Added `services/jobs.ts` with REST + mock fallback, refactored `AppPage.tsx` to load/list jobs via the service, start/refine through API calls, and poll for status updates while keeping queue UX intact.

---

### Task 18 – Arabic/English Processing Metadata (Frontend Integration)

- **ID:** T18
- **Status:** [ ]
- **Priority:** Medium
- **Goal:** Ensure each job carries enough metadata for the backend to perform proper bilingual processing (even if backend implementation is separate).
- **Details:**
  - Extend frontend job payloads to include:
    - `resumeLang`, `jobDescriptionLang`, maybe `desiredOutputLang`.
  - Pass these fields from:
    - `OptimizationForm` (from T5) → `handleStartOptimization` → `jobsService.createJob`.
  - Adjust `OptimizationResult` / `JobQueueItem` types in `types.ts` if needed to include language fields.
- **Affected files:** `components/OptimizationForm.tsx`, `pages/AppPage.tsx`, `services/jobs.ts`, `types.ts`.
- **Dependencies:** T5, T17.
- **Completion Notes:** (to be filled by agent)

---

### Task 19 – Frontend Error Handling & Edge Cases

- **ID:** T19
- **Status:** [ ]
- **Priority:** Medium
- **Goal:** Improve robustness of user flows for long texts, file parsing failures, and network errors.
- **Details:**
  - In `components/OptimizationForm.tsx`:
    - Validate file type and size on upload; show clear localized error messages.
    - Prevent submission when validation fails.
  - In `pages/AppPage.tsx`:
    - Wrap `onStartOptimization` and `onRefine` calls to the service in try/catch.
    - Show error toasts (`ToastMessage`) when exceptions occur.
    - Remove or roll back jobs that fail to start or refine, as appropriate.
  - Optionally add simple client‑side limits on textarea length to prevent excessively large payloads.
- **Affected files:** `components/OptimizationForm.tsx`, `pages/AppPage.tsx`, `components/ui/Toast.tsx`.
- **Dependencies:** T17.
- **Completion Notes:** (to be filled by agent)

---

## Phase 5 – Product Polish & Future Work

### Task 20 – Clarify Value Proposition for Arab Users (Copy & Structure)

- **ID:** T20
- **Status:** [ ]
- **Priority:** Medium
- **Goal:** Reflect the unique value for Arabic‑speaking users directly in the product copy and structure.
- **Details:**
  - Update hero text and subcopy (likely in `Navbar` or a top‑of‑page section) to emphasize:
    - Bilingual (Arabic/English) CV optimization.
    - ATS‑friendly Arabic formatting.
    - Ability to generate or align English resumes with Arabic experience.
  - Where possible, incorporate short localized explanations near key features (e.g., why a certain Arabic CV practice is recommended or discouraged).
  - Ensure both English and Arabic copy feel native and consistent with the translation system.
- **Affected files:** `components/layout/Navbar.tsx`, any hero/intro sections in `pages/AppPage.tsx`, `translations.ts`.
- **Dependencies:** T4, T3.
- **Completion Notes:** (to be filled by agent)

---

End of TODO list. Agents should append any new tasks below this line with a new incremental ID (T21, T22, …) and keep the same structure.

### Task 21 – Language-Aware Typography

- **ID:** T21
- **Status:** [x]
- **Priority:** Medium
- **Goal:** Ensure Arabic UI uses glyph-friendly fonts so mirrored layouts feel intentional and legible.
- **Details:**
  - Load complementary Latin + Arabic font families (e.g., Inter + Cairo).
  - Apply Latin font globally and automatically switch to the Arabic font when `dir="rtl"`.
  - Keep implementation CSS-only so React components remain unchanged.
- **Affected files:** `index.html`.
- **Dependencies:** T3.
- **Completion Notes:** Added Google Fonts for Inter + Cairo and injected CSS to use Inter globally while applying Cairo to `[dir="rtl"]` blocks in `index.html`.
