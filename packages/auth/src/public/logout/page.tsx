import { type ActionFunctionArgs, redirect } from "react-router";
import { useSupabaseServerContext } from "../../.server";

export async function loader({ context }: ActionFunctionArgs) {
  const supabase = useSupabaseServerContext(context);

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(error);
    return { success: false, error: error.message };
  }

  // Redirect to dashboard or home page after successful sign-in
  return redirect("/");
}
