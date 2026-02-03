import { API_BASE_URL, API_CONFIGURED } from '../config';

type UploadsServiceOptions = {
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

export type ResumeExtractResult = {
  filename?: string;
  text?: string;
  char_count?: number;
  method?: string;
};

const shouldUseMockApi =
  import.meta.env.VITE_USE_JOB_MOCKS === 'true' ||
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  !API_CONFIGURED;

const buildAuthHeaders = (accessToken?: string): HeadersInit => {
  if (!accessToken) {
    return {};
  }
  return { Authorization: `Bearer ${accessToken}` };
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

export const uploadsService = {
  async extractResumeText(
    file: File,
    options: UploadsServiceOptions = {}
  ): Promise<ResumeExtractResult> {
    if (shouldUseMockApi) {
      const fallbackText = await file.text();
      return {
        filename: file.name,
        text: fallbackText,
        char_count: fallbackText.length,
        method: 'mock-text',
      };
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
      method: 'POST',
      headers: buildAuthHeaders(options.accessToken),
      body: formData,
      signal: options.signal,
    });

    return parseResponse<ResumeExtractResult>(response);
  },
};
