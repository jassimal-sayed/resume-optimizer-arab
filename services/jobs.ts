import { API_BASE_URL, API_CONFIGURED } from '../config';
import type {
  CreateJobPayload,
  CreateJobResponse,
  JobDetailResponse,
  JobRecord,
  JobSummary,
  JobsListResponse,
  OptimizationResult,
  RefineJobPayload,
} from '../types';

const MOCK_COMPLETION_DELAY = 3000;
const MOCK_REFINEMENT_DELAY = 2500;

type JobsServiceOptions = {
  accessToken?: string;
  signal?: AbortSignal;
};

type ApiError = {
  code?: string;
  message: string;
  details?: Record<string, unknown>;
};

interface ApiEnvelope<T> {
  data: T;
  error: ApiError | null;
}

const shouldUseMockApi =
  import.meta.env.VITE_USE_JOB_MOCKS === 'true' ||
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  !API_CONFIGURED;

const buildHeaders = (accessToken?: string): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    const message =
      payload.error?.message ||
      `Request failed with status ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }
  return payload.data;
}

const delay = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

let mockJobs: JobRecord[] = [];
const mockJobTimers: Record<string, number> = {};

const mockResultTemplate: OptimizationResult = {
  id: 'opt_mock',
  score: 88,
  missingKeywords: ['Agile', 'JIRA', 'Confluence', 'CI/CD'],
  coveredKeywords: [
    'React',
    'TypeScript',
    'Node.js',
    'UI/UX Design',
    'Figma',
    'Storybook',
  ],
  changeLog: [
    'Rewrote summary to better align with senior-level expectations.',
    'Quantified achievements with metrics to highlight impact.',
    'Added a dedicated technical skills section for better keyword matching.',
    'Rephrased responsibilities to use more active language.',
  ],
  previewMarkdown: `# Your Name

## Summary

Results-driven Senior Frontend Engineer with over 8 years of experience building and scaling responsive web applications. Expert in React, TypeScript, and modern UI/UX principles, with a proven track record of leading teams to deliver high-quality software.

## Experience

**Lead Frontend Engineer** @ TechSolutions Inc. (2020-Present)

*   Led the architecture and development of a new component-based design system in React and Storybook, improving developer efficiency by 40%.
*   Mentored a team of 4 junior developers, resulting in a 25% increase in team velocity and a 50% reduction in bug reports.
*   Engineered a performant state management solution using Redux Toolkit, decreasing initial page load time by 300ms.

## Skills

*   **Languages:** TypeScript, JavaScript (ESNext), HTML5, CSS3/SASS
*   **Frameworks:** React, Next.js, Vue.js
*   **Tools & Platforms:** Webpack, Vite, Docker, Git, Figma, JIRA`,
  detectedResumeLang: 'en',
  detectedJobDescLang: 'en',
};

const cloneResult = (overrides?: Partial<OptimizationResult>): OptimizationResult => ({
  ...mockResultTemplate,
  id: `opt_${Date.now()}`,
  changeLog: [...mockResultTemplate.changeLog],
  missingKeywords: [...mockResultTemplate.missingKeywords],
  coveredKeywords: [...mockResultTemplate.coveredKeywords],
  ...(overrides ?? {}),
});

const cloneJobRecord = (job: JobRecord): JobRecord => ({
  ...job,
  result: job.result
    ? {
        ...job.result,
        changeLog: [...job.result.changeLog],
        coveredKeywords: [...job.result.coveredKeywords],
        missingKeywords: [...job.result.missingKeywords],
      }
    : null,
});

const normalizeTitle = (payload: CreateJobPayload) => {
  if (payload.title?.trim()) {
    return payload.title.trim();
  }
  const fallback = payload.jobDescription
    .split('\n')
    .map(line => line.trim())
    .find(Boolean);
  return fallback ? `${fallback.slice(0, 80)}${fallback.length > 80 ? '…' : ''}` : 'Optimization Job';
};

const toJobSummary = (job: JobRecord): JobSummary => ({
  id: job.id,
  title: job.title,
  company: job.company,
  status: job.status,
  resumeLang: job.resumeLang,
  jdLang: job.jdLang,
  desiredOutputLang: job.desiredOutputLang,
  result: job.result,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
});

const scheduleMockCompletion = (jobId: string, instructions?: string, delayMs = MOCK_COMPLETION_DELAY) => {
  if (mockJobTimers[jobId]) {
    clearTimeout(mockJobTimers[jobId]);
  }
  mockJobTimers[jobId] = setTimeout(() => {
    const jobIndex = mockJobs.findIndex(job => job.id === jobId);
    if (jobIndex === -1) {
      return;
    }
    const job = mockJobs[jobIndex];
    const updatedResult = cloneResult(
      instructions
        ? {
            changeLog: [`Applied refinement: ${instructions}`, ...mockResultTemplate.changeLog],
          }
        : undefined
    );
    mockJobs[jobIndex] = {
      ...job,
      status: 'complete',
      updatedAt: new Date().toISOString(),
      result: updatedResult,
    };
    delete mockJobTimers[jobId];
  }, delayMs);
};

const createJobMock = async (payload: CreateJobPayload): Promise<JobSummary> => {
  await delay(400);
  const now = new Date().toISOString();
  const job: JobRecord = {
    id: `job_${Date.now()}`,
    userId: 'user_mock',
    title: normalizeTitle(payload),
    company: payload.company ?? null,
    resumeText: payload.resumeText,
    jobDescription: payload.jobDescription,
    customInstructions: payload.customInstructions ?? null,
    resumeLang: payload.resumeLang,
    jdLang: payload.jdLang,
    desiredOutputLang: payload.desiredOutputLang ?? payload.resumeLang,
    status: 'processing',
    result: null,
    createdAt: now,
    updatedAt: now,
  };
  mockJobs = [job, ...mockJobs];
  scheduleMockCompletion(job.id);
  return toJobSummary(job);
};

const listJobsMock = async (): Promise<JobSummary[]> => {
  await delay(200);
  return mockJobs
    .slice()
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    .map(toJobSummary);
};

const getJobMock = async (jobId: string): Promise<JobRecord> => {
  await delay(200);
  const job = mockJobs.find(item => item.id === jobId);
  if (!job) {
    throw new Error('Job not found');
  }
  return cloneJobRecord(job);
};

const refineJobMock = async (
  jobId: string,
  payload: RefineJobPayload
): Promise<JobSummary> => {
  await delay(300);
  const jobIndex = mockJobs.findIndex(job => job.id === jobId);
  if (jobIndex === -1) {
    throw new Error('Job not found');
  }
  const existing = mockJobs[jobIndex];
  const updated: JobRecord = {
    ...existing,
    status: 'processing',
    updatedAt: new Date().toISOString(),
  };
  mockJobs[jobIndex] = updated;
  scheduleMockCompletion(jobId, payload.instructions, MOCK_REFINEMENT_DELAY);
  return toJobSummary(updated);
};

export const jobsService = {
  async createJob(payload: CreateJobPayload, options: JobsServiceOptions = {}): Promise<JobSummary> {
    if (shouldUseMockApi) {
      return createJobMock(payload);
    }
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: buildHeaders(options.accessToken),
      signal: options.signal,
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<CreateJobResponse>(response);
    return data.job;
  },

  async listJobs(options: JobsServiceOptions = {}): Promise<JobSummary[]> {
    if (shouldUseMockApi) {
      return listJobsMock();
    }
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'GET',
      headers: buildHeaders(options.accessToken),
      signal: options.signal,
    });
    const data = await parseResponse<JobsListResponse>(response);
    return data.jobs;
  },

  async getJob(id: string, options: JobsServiceOptions = {}): Promise<JobRecord> {
    if (shouldUseMockApi) {
      return getJobMock(id);
    }
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'GET',
      headers: buildHeaders(options.accessToken),
      signal: options.signal,
    });
    const data = await parseResponse<JobDetailResponse>(response);
    return data.job;
  },

  async refineJob(
    id: string,
    payload: RefineJobPayload,
    options: JobsServiceOptions = {}
  ): Promise<JobSummary> {
    if (shouldUseMockApi) {
      return refineJobMock(id, payload);
    }
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/refine`, {
      method: 'POST',
      headers: buildHeaders(options.accessToken),
      signal: options.signal,
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<{ job: JobSummary }>(response);
    return data.job;
  },
};
