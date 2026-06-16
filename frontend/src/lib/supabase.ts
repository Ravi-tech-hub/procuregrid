import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function getSupabaseConfig() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing VITE_SUPABASE_URL");
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY");
  }

  return { supabaseUrl, supabaseAnonKey };
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
