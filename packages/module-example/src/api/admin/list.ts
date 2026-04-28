import { JsonResponse } from "@repo/core/server";
import { useAuthServerContext } from "@repo/auth/server";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = useAuthServerContext(context);
  if (!user.checkPermissions(["example.list"])) {
    return JsonResponse.error("Forbidden", 403);
  }

  const data: object[] = [];
  const totalCounts = 0;
  const totalPages = 0;
  return JsonResponse.paging({
    data,
    totalCounts,
    totalPages,
  });
}
