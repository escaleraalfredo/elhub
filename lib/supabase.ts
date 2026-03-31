import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const hasConfig = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

if (!hasConfig && typeof window !== "undefined") {
  console.warn(
    "[ElHub] Supabase env vars not set. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = hasConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
