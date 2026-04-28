import type { RouterContextProvider } from "react-router";
import { createContext } from "react-router";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@repo/env/server";

export function createSupabaseSSR(request: Request) {
  const headers = new Headers();
  const loggingFetch: typeof fetch = async (input, init) => {
    console.log(`[${request.url}] Request:`, input, init);
    const response = await fetch(input, init);
    // const clone = response.clone();
    // try {
    //   const data = await clone.json().catch(() => null);
    //   // console.log("Response:", response.status, data);
    // } catch {}
    return response;
  };

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables");
  }
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "") as {
          name: string;
          value: string;
        }[];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          headers.append(
            "Set-Cookie",
            serializeCookieHeader(name, value, options),
          ),
        );
      },
    },
    global: {
      fetch: process.env.NODE_ENV == "production" ? fetch : loggingFetch,
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  const result = { headers, supabase };
  return result;
}

const SupabaseServerContext = createContext<
  ReturnType<typeof createSupabaseSSR>["supabase"] | null
>(null);

export function setSupabaseServerContext(
  context: Readonly<RouterContextProvider>,
  supabase: ReturnType<typeof createSupabaseSSR>["supabase"],
) {
  context.set(SupabaseServerContext, supabase);
}

export function useSupabaseServerContext(
  context: Readonly<RouterContextProvider>,
) {
  const supabase = context.get(SupabaseServerContext);
  if (!supabase) {
    throw new Error(
      "useSupabaseServerContext must be used within an root.tsx context.set();",
    );
  }
  return supabase;
}
