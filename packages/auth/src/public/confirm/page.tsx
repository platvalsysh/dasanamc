import { type EmailOtpType } from "@supabase/supabase-js";
import { type LoaderFunctionArgs, redirect } from "react-router";
import { useSupabaseServerContext } from "../../.server/SupabaseServerContext";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const _next = requestUrl.searchParams.get("next");
  const next = _next?.startsWith("/") ? _next : "/";

  const supabase = useSupabaseServerContext(context);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirect(next);
    } else {
      const params = new URLSearchParams();
      params.set("error", error.message);
      return redirect(`/auth/error?${params.toString()}`);
    }
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return redirect(next);
    } else {
      const params = new URLSearchParams();
      params.set("error", error.message);
      return redirect(`/auth/error?${params.toString()}`);
    }
  }

  // redirect the user to an error page with some instructions
  const params = new URLSearchParams();
  params.set("error", "No token hash, type or code");
  return redirect(`/auth/error?${params.toString()}`);
}
