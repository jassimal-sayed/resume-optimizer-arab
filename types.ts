
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

export type User = SupabaseUser;
export type Session = SupabaseSession;

export type LanguageCode = 'en' | 'ar';

export type JobStatus = 'queued' | 'processing' | 'complete' | 'failed';

export interface Resume {
  id: string;
  title: string;
}

export interface OptimizationResult {
  id: string;
  score: number;
  missingKeywords: string[];
  coveredKeywords: string[];
  changeLog: string[];
  previewMarkdown: string;
  detectedResumeLang?: LanguageCode;
  detectedJobDescLang?: LanguageCode;
  extractedEntities?: {
    skills: string[];
    tools: string[];
    education: string[];
    experience: {
      role: string;
      company?: string;
      duration?: string;
      highlights?: string[];
    }[];
  };
  alignmentInsights?: {
    matched: string[];
    missing: string[];
    weak: string[];
    evidence?: {
      source: 'resume' | 'job' | 'retrieval';
      snippet: string;
      score?: number;
      note?: string;
    }[];
  };
  reliability?: {
    invalidJsonRatePct?: number;
    lastRunValid?: boolean;
    latencySeconds?: number;
    avgLatencySeconds?: number;
  };
  evaluation?: {
    extractionAccuracy?: number;
    matchingPrecision?: number;
    retrievalRelevance?: number;
    feedbackQuality?: number;
  };
  retrievalContexts?: {
    snippet: string;
    source: 'resume' | 'job' | 'retrieval';
    score?: number;
  }[];
  translationNotes?: string[];
}

export interface JobRecord {
  id: string;
  userId: string;
  title: string;
  company: string | null;
  resumeText: string;
  jobDescription: string;
  customInstructions: string | null;
  resumeLang: LanguageCode;
  jdLang: LanguageCode;
  desiredOutputLang: LanguageCode;
  status: JobStatus;
  result: OptimizationResult | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobSummary {
  id: string;
  title: string;
  company: string | null;
  status: JobStatus;
  resumeLang: LanguageCode;
  jdLang: LanguageCode;
  desiredOutputLang: LanguageCode;
  result: OptimizationResult | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPayload {
  title?: string;
  company?: string;
  resumeText: string;
  jobDescription?: string;
  customInstructions?: string;
  resumeLang: LanguageCode;
  jdLang: LanguageCode;
  desiredOutputLang?: LanguageCode;
}

export interface CreateJobResponse {
  job: JobSummary;
}

export interface JobsListResponse {
  jobs: JobSummary[];
}

export interface JobDetailResponse {
  job: JobRecord;
}

export interface RefineJobPayload {
  instructions: string;
  desiredOutputLang?: LanguageCode;
}

export interface JobQueueItem {
  id: string;
  title: string;
  status: JobStatus;
  result: OptimizationResult | null;
  metadata?: {
    company?: string;
    resumeLang?: LanguageCode;
    jobDescriptionLang?: LanguageCode;
    desiredOutputLang?: LanguageCode;
  };
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}
