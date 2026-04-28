import { JsonResponse } from "@repo/core/server";
import { useAuthServerContext } from "@repo/auth/server";
import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";

const actionParamsSchema = z.object({
  id: z.string().uuid(),
});

const actionBodySchema = z.object({
  // Define your schema here
});

export async function action({ request, context, params }: ActionFunctionArgs) {
  const user = useAuthServerContext(context);

  const paramsResult = actionParamsSchema.safeParse(params);
  if (!paramsResult.success) {
    return JsonResponse.error("Invalid params", 400);
  }

  const { id } = paramsResult.data;

  const contentType = request.headers.get("content-type");
  let bodyData;

  if (contentType?.includes("application/json")) {
    bodyData = await request.json();
  } else {
    const formData = await request.formData();
    bodyData = Object.fromEntries(formData);
  }

  const bodyResult = actionBodySchema.safeParse(bodyData);
  if (!bodyResult.success) {
    return JsonResponse.error("Invalid request body", 400);
  }

  // Logic to edit would go here
  const data = {};

  return JsonResponse.ok(data);
}
