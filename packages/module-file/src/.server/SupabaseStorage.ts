import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@repo/env/server";

const url = SUPABASE_URL || "http://placeholder-for-build";
const key = SUPABASE_SERVICE_ROLE_KEY || "placeholder-for-build";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "⚠️ [SupabaseStorage] Missing Supabase environment variables. This is allowed during build scanning but will fail at runtime.",
  );
}
const loggingFetch: typeof fetch = async (input, init) => {
  console.log(`[supabaseAdmin] Request:`, input, init);
  const response = await fetch(input, init);
  // const clone = response.clone();
  // try {
  //   const data = await clone.json().catch(() => null);
  //   // console.log("Response:", response.status, data);
  // } catch {}
  return response;
};
// Create Supabase client with service role key for server-side operations
export const supabaseAdmin = createClient(url, key, {
  global: {
    fetch: process.env.NODE_ENV == "production" ? fetch : loggingFetch,
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
},
);
