import { JsonResponse } from "@repo/core/server";
import { useAuthServerContext } from "@repo/auth/server";
import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

const loaderSchema = z.object({
  id: z.string().uuid(),
});

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const user = useAuthServerContext(context);
  if (!user.checkPermissions(["example.view"])) {
    return JsonResponse.error("Forbidden", 403);
  }

  const result = loaderSchema.safeParse(params);
  if (!result.success) {
    return JsonResponse.error("Invalid params", 400);
  }

  const { id } = result.data;

  const data = await (async function () {
    return {} as object | null;
  })();

  if (!data) {
    return JsonResponse.error("Not found", 404);
  }

  return JsonResponse.ok(data);
}
