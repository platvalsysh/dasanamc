import { type LoaderFunctionArgs } from "react-router";
import { JsonResponse } from "@repo/core/server";
import { FileService } from "../.server/FileService";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const fileId = params.fileId;

  if (!fileId) {
    return JsonResponse.error("File ID is required", 400);
  }

  try {
    const downloadUrl = await FileService.getDownloadUrl(fileId);

    return JsonResponse.ok({ downloadUrl });
  } catch (error) {
    console.error("Error getting download URL:", error);
    return JsonResponse.error("Failed to get download URL", 500);
  }
}
