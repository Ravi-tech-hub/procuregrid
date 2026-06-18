import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

// Public browser-side Supabase settings. These values are equivalent to the
// VITE_* env vars and let production keep working if a host misses build-time
// env injection for the client bundle.
const PUBLIC_SUPABASE_FALLBACK = {
  url: "https://pmluulzaaqtmdvbzqnox.supabase.co",
  publishableKey: "sb_publishable_ZgqJfpmdELOd90nAq-vqWg_7aty8sQb",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbHV1bHphYXF0bWR2Ynpxbm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODU4MDEsImV4cCI6MjA5NDE2MTgwMX0.mW9saKRiMmsaQKkHea-4646qV9YxukYriPiK_36C3jk",
} as const;

export function getSupabaseConfig() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || PUBLIC_SUPABASE_FALLBACK.url;
  const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    PUBLIC_SUPABASE_FALLBACK.anonKey ||
    PUBLIC_SUPABASE_FALLBACK.publishableKey;

  if (!supabaseUrl) {
    throw new Error("Missing VITE_SUPABASE_URL");
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY");
  }

  return { supabaseUrl, supabaseAnonKey };
}

export function createSupabaseEphemeralClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("Supabase browser client requested during server rendering");
  }

  if (browserClient) {
    return browserClient;
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  browserClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
