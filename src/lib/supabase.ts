import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing from .env.local");
}

if (!supabaseKey) {
  throw new Error(
    "Supabase publishable key is missing from .env.local",
  );
}

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseKey
);