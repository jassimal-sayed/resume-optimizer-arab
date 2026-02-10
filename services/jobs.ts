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
  extractedEntities: {
    skills: ['Frontend Architecture', 'Design Systems', 'Mentorship', 'UI/UX Collaboration'],
    tools: ['React', 'TypeScript', 'Storybook', 'Figma', 'Node.js', 'CI/CD'],
    education: ['B.Sc. Computer Science — King Saud University (2015)'],
    experience: [
      {
        role: 'Lead Frontend Engineer',
        company: 'TechSolutions Inc.',
        duration: '2020–Present',
        highlights: [
          'Architected a component-based design system across 5 squads.',
          'Mentored 4 engineers and improved delivery velocity by 25%.',
        ],
      },
    ],
  },
  alignmentInsights: {
    matched: ['React', 'TypeScript', 'Design Systems'],
    missing: ['AWS', 'Accessibility testing'],
    weak: ['CI/CD depth'],
    evidence: [
      {
        source: 'resume',
        snippet: 'Led the architecture and development of a new component-based design system in React and Storybook.',
        score: 0.82,
      },
      {
        source: 'job',
        snippet: 'Role requires ownership of CI/CD and observability practices.',
        score: 0.71,
        note: 'Add pipeline and monitoring examples.',
      },
    ],
  },
  reliability: {
    invalidJsonRatePct: 1.2,
    lastRunValid: true,
    latencySeconds: 14,
    avgLatencySeconds: 12,
  },
  evaluation: {
    extractionAccuracy: 92,
    matchingPrecision: 88,
    retrievalRelevance: 90,
    feedbackQuality: 86,
  },
  retrievalContexts: [
    {
      source: 'resume',
      snippet: 'Component-based design system in React and Storybook improved developer efficiency by 40%.',
      score: 0.83,
    },
    {
      source: 'job',
      snippet: 'Looking for leaders who can mentor teams and drive UI/UX best practices with metrics.',
      score: 0.8,
    },
    {
      source: 'retrieval',
      snippet: 'CI/CD ownership and observability are required to stabilize releases.',
      score: 0.76,
    },
  ],
  translationNotes: [
    'Localized summary into Arabic while preserving English keywords for ATS parsing.',
    'Applied RTL-safe spacing for Arabic headings and ensured bilingual section ordering.',
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

const deepCloneResult = (result: OptimizationResult): OptimizationResult => ({
  ...result,
  changeLog: [...result.changeLog],
  missingKeywords: [...result.missingKeywords],
  coveredKeywords: [...result.coveredKeywords],
  extractedEntities: result.extractedEntities
    ? {
      ...result.extractedEntities,
      skills: [...result.extractedEntities.skills],
      tools: [...result.extractedEntities.tools],
      education: [...result.extractedEntities.education],
      experience: result.extractedEntities.experience.map(entry => ({
        ...entry,
        highlights: entry.highlights ? [...entry.highlights] : undefined,
      })),
    }
    : undefined,
  alignmentInsights: result.alignmentInsights
    ? {
      ...result.alignmentInsights,
      matched: [...result.alignmentInsights.matched],
      missing: [...result.alignmentInsights.missing],
      weak: [...result.alignmentInsights.weak],
      evidence: result.alignmentInsights.evidence?.map(item => ({ ...item })),
    }
    : undefined,
  reliability: result.reliability ? { ...result.reliability } : undefined,
  evaluation: result.evaluation ? { ...result.evaluation } : undefined,
  retrievalContexts: result.retrievalContexts?.map(ctx => ({ ...ctx })),
  translationNotes: result.translationNotes ? [...result.translationNotes] : undefined,
});

const cloneResult = (overrides?: Partial<OptimizationResult>): OptimizationResult =>
  deepCloneResult({
    ...mockResultTemplate,
    id: `opt_${Date.now()}`,
    ...(overrides ?? {}),
  });

const cloneJobRecord = (job: JobRecord): JobRecord => ({
  ...job,
  result: job.result ? deepCloneResult(job.result) : null,
});

const normalizeTitle = (payload: CreateJobPayload) => {
  if (payload.title?.trim()) {
    return payload.title.trim();
  }
  if (!payload.jobDescription?.trim()) {
    return 'General Resume Review';
  }
  const fallback = payload.jobDescription
    .split('\n')
    .map(line => line.trim())
    .find(Boolean);
  return fallback ? `${fallback.slice(0, 80)}${fallback.length > 80 ? '…' : ''}` : 'Analysis Job';
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
  mockJobTimers[jobId] = window.setTimeout(() => {
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
    jobDescription: payload.jobDescription ?? '',
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
