import { type ActionFunctionArgs } from "react-router";
import { FileService } from "../.server/FileService";

import { getErrorMessage } from "@repo/core/utils";
export async function action({ request, params }: ActionFunctionArgs) {
  const fileId = params.fileId;
  if (!fileId) {
    return Response.json({ message: "Invalid Reference" }, { status: 400 });
  }
  
  try {
     const result = await FileService.generateThumbnail(fileId);
     return Response.json(result);
  } catch (e) {
    console.error("Thumbnail generation failed:", e);
    return Response.json({ message: getErrorMessage(e) || "Failed" }, { status: 500 });
  }
}
