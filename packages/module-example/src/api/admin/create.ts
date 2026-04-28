import { JsonResponse } from "@repo/core/server";
import { useAuthServerContext } from "@repo/auth/server";
import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";

const actionBodySchema = z.object({
  // Define your schema here
});

export async function action({ request, context }: ActionFunctionArgs) {
  const user = useAuthServerContext(context);

  const contentType = request.headers.get("content-type");
  let bodyData;

  if (contentType?.includes("application/json")) {
    bodyData = await request.json();
  } else {
    const formData = await request.formData();
    bodyData = Object.fromEntries(formData);
  }

  const result = actionBodySchema.safeParse(bodyData);
  if (!result.success) {
    return JsonResponse.error("Invalid request body", 400);
  }

  // Logic to create would go here
  const data = {};

  return JsonResponse.ok(data);
}
