import { JsonResponse } from "@repo/core/server";
import { useAuthServerContext } from "@repo/auth/server";
import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";

const actionSchema = z.object({
  id: z.string().uuid(),
});

export async function action({ request, context, params }: ActionFunctionArgs) {
  const user = useAuthServerContext(context);

  const result = actionSchema.safeParse(params);
  if (!result.success) {
    return JsonResponse.error("Invalid params", 400);
  }

  const { id } = result.data;

  // Logic to delete would go here
  const data = {};

  return JsonResponse.ok(data);
}
