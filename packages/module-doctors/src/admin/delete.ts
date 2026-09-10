import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { useAuthServerContext } from "@repo/auth/server";
import { DoctorsService } from "../.server/DoctorsService";

/** GET 은 목록으로 돌려보냄 (POST 전용 리소스 라우트) */
export async function loader({ context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["doctors.list", "doctors.*"]);
  return redirect("/admin/doctors");
}

export async function action({ params, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["doctors.delete", "doctors.*"]);
  try {
    await DoctorsService.remove(params.id!);
  } catch (e) {
    console.error("[doctors.delete]", e);
    throw new Response("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", { status: 500 });
  }
  return redirect("/admin/doctors");
}
