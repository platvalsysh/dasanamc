import { type ActionFunctionArgs } from "react-router";
import { JsonResponse } from "@repo/core/server";
import { FileService } from "../.server/FileService";
import { z } from "zod";
import { useAuthServerContext } from "@repo/auth/server";

const uploadUrlSchema = z.object({
  module: z.string(),
  moduleId: z.string().uuid().optional().nullable(),
  targetId: z.string().uuid().optional().nullable(),
  filename: z.string(),
  mimeType: z.string(),
  fileSize: z.number(),
  bucket: z.string().optional(),
});

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return JsonResponse.error("Method not allowed", 405);
  }
  const auth = useAuthServerContext(context);

  try {
    const body = await request.json();
    const params = uploadUrlSchema.parse(body);

    // Get user ID from context if available
    const userId = auth.getUser()?.id;

    const result = await FileService.createUploadUrl({
      ...params,
      userId,
    });

    return JsonResponse.ok(result);
  } catch (error) {
    console.error("Error creating upload URL:", error);
    if (error instanceof z.ZodError) {
      return JsonResponse.error("Invalid request data", 400);
    }
    return JsonResponse.error("Failed to create upload URL", 500);
  }
}
