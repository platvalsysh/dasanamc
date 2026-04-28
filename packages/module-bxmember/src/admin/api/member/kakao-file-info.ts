import { SolapiSmsProvider } from "@repo/module-sms/server";
import { useAuthServerContext } from "@repo/auth/server";
import { type ActionFunctionArgs, data } from "react-router";

import { getErrorMessage } from "@repo/core/utils";
export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  // Check permission for member list or similar high-level permission
  if (!auth.checkPermissions(["bxmember.member.list"])) {
    throw data({ success: false, error: "Permission denied" }, { status: 403 });
  }

  const formData = await request.formData();
  const fileId = formData.get("fileId") as string;

  if (!fileId) {
    return Response.json({ success: false, error: "File ID is required" }, { status: 400 });
  }

  const provider = new SolapiSmsProvider();
  
  try {
    const fileInfo = await provider.getFile(fileId);
    return Response.json({ success: true, fileInfo });
  } catch (e) {
    console.error(`Failed to fetch Solapi file info for ${fileId}`, e);
    return Response.json({ success: false, error: getErrorMessage(e) }, { status: 500 });
  }
}
