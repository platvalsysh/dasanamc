import { type LoaderFunctionArgs } from "react-router";
import { JsonResponse } from "@repo/core/server";
import { FileService } from "../.server/FileService";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const module = url.searchParams.get("module") || undefined;
  const moduleId = url.searchParams.get("moduleId") || undefined;
  const targetId = url.searchParams.get("targetId") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "100");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  try {
    const files = await FileService.getFilesList({
      module,
      moduleId,
      targetId,
      limit,
      offset,
    });

    return JsonResponse.ok({ files });
  } catch (error) {
    console.error("Error fetching files list:", error);
    return JsonResponse.error("Failed to fetch files", 500);
  }
}
