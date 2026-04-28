import { createBrowserClient } from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useMemo, useState } from "react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const url = supabaseUrl || "http://placeholder-for-build";
const key = supabaseAnonKey || "placeholder-for-build";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ [SupabaseBrowserContext] Missing Supabase environment variables. This is allowed during build scanning but will fail at runtime.",
  );
}

type SupabaseContext = {
  supabase: SupabaseClient;
};

const GLOBAL_SUPABASE_CONTEXT_KEY = "__REPO_SUPABASE_BROWSER_CONTEXT__";

const Context = (function () {
  const g = (typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
      ? global
      : {}) as any;
  if (!g[GLOBAL_SUPABASE_CONTEXT_KEY]) {
    g[GLOBAL_SUPABASE_CONTEXT_KEY] = createContext<SupabaseContext | undefined>(undefined);
  }
  return g[GLOBAL_SUPABASE_CONTEXT_KEY];
})() as React.Context<SupabaseContext | undefined>;

export function SupabaseBrowserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() =>
    createBrowserClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }),
  );

  const value = useMemo(() => ({ supabase }), [supabase]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error(
      "useSupabase must be used within a SupabaseBrowserProvider",
    );
  }
  return context.supabase;
};
