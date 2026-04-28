import { type ActionFunctionArgs } from "react-router";
import { JsonResponse } from "@repo/core/server";
import { FileService } from "../.server/FileService";
import { z } from "zod";

const markUploadedSchema = z.object({
  fileId: z.string().uuid(),
});

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return JsonResponse.error("Method not allowed", 405);
  }

  try {
    const body = await request.json();
    const { fileId } = markUploadedSchema.parse(body);

    await FileService.markAsUploaded(fileId);
    const publicUrl = await FileService.getPublicUrl(fileId);

    return JsonResponse.ok({ success: true, publicUrl });
  } catch (error) {
    console.error("Error marking file as uploaded:", error);
    if (error instanceof z.ZodError) {
      return JsonResponse.error("Invalid request data", 400);
    }
    return JsonResponse.error("Failed to update file record", 500);
  }
}
