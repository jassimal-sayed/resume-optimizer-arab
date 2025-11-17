const DEFAULT_API_BASE_URL = 'http://localhost:8787';
const DEFAULT_SUPABASE_URL = 'http://localhost:54321';
const DEFAULT_SUPABASE_ANON_KEY = 'local-development-anon-key';

/**
 * Helper that reads from Vite env and falls back to safe local placeholders.
 * This keeps production secrets in .env files while allowing the UI to run locally.
 */
const withFallback = (value: string | undefined, fallback: string) => {
  if (value && value.trim().length > 0) {
    return value;
  }
  return fallback;
};

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const API_BASE_URL: string = withFallback(
  rawApiBaseUrl,
  DEFAULT_API_BASE_URL
);

export const SUPABASE_URL: string = withFallback(
  rawSupabaseUrl,
  DEFAULT_SUPABASE_URL
);

export const SUPABASE_ANON_KEY: string = withFallback(
  rawSupabaseAnonKey,
  DEFAULT_SUPABASE_ANON_KEY
);

export const SUPABASE_CONFIGURED = Boolean(rawSupabaseUrl && rawSupabaseAnonKey);
export const API_CONFIGURED = Boolean(rawApiBaseUrl);
