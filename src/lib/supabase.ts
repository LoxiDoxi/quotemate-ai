import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseKey) {
  throw new Error("Missing Supabase key");
}

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      // Keep the user logged in
      persistSession: true,

      // Turn this off to stop the refresh-token loop
      // that was causing the 429 error
      autoRefreshToken: false,

      // Needed for OAuth/session handling
      detectSessionInUrl: true,
    },
  }
);