import { type ActionFunctionArgs } from "react-router";
import { JsonResponse } from "@repo/core/server";
import { FileService } from "../.server/FileService";
import { z } from "zod";

const publishSchema = z.object({
  targetId: z.string().uuid(),
});

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return JsonResponse.error("Method not allowed", 405);
  }

  try {
    const body = await request.json();
    const { targetId } = publishSchema.parse(body);

    await FileService.publishFiles(targetId);

    return JsonResponse.ok({ success: true });
  } catch (error) {
    console.error("Error publishing files:", error);
    if (error instanceof z.ZodError) {
      return JsonResponse.error("Invalid request data", 400);
    }
    return JsonResponse.error("Failed to publish files", 500);
  }
}
