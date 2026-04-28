import { type ActionFunctionArgs } from "react-router";
import { JsonResponse } from "@repo/core/server";
import { FileService } from "../.server/FileService";
import { z } from "zod";

import { useAuthServerContext } from "@repo/auth/server";

const deleteSchema = z.object({
  fileId: z.string().uuid(),
});

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "DELETE" && request.method !== "POST") {
    return JsonResponse.error("Method not allowed", 405);
  }

  const auth = useAuthServerContext(context);

  try {
    const body = await request.json();
    const { fileId } = deleteSchema.parse(body);

    const file = await FileService.getFileById(fileId);
    if (!file) {
      return JsonResponse.error("File not found", 404);
    }

    const user = auth.getUser();
    const isOwner = file.uploaded_by === user?.id;
    const isAdmin = auth.isSuperAdmin();

    if (!isOwner && !isAdmin) {
      return JsonResponse.error("Unauthorized", 403);
    }

    await FileService.deleteFile(fileId);

    return JsonResponse.ok({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    if (error instanceof z.ZodError) {
      return JsonResponse.error("Invalid request data", 400);
    }
    return JsonResponse.error("Failed to delete file", 500);
  }
}
