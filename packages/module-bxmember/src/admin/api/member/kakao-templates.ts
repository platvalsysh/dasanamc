import { SolapiSmsProvider } from "@repo/module-sms/server";
import { useAuthServerContext } from "@repo/auth/server";
import { type ActionFunctionArgs, data } from "react-router";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.member.list"])) {
    throw data({ success: false, error: "Permission denied" }, { status: 403 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string || undefined;
  const channelId = formData.get("channelId") as string || undefined;

  const provider = new SolapiSmsProvider();
  
  try {
    const service = await provider.getService();
    // Fetch only APPROVED templates by default for sending
    const result = await service.getKakaoAlimtalkTemplates({
      status: "APPROVED",
      name: name ? { like: name } : undefined,
      channelId,
      limit: 100
    });

    return Response.json({ success: true, templates: result.templateList || [] });
  } catch (e: any) {
    console.error("Failed to fetch Kakao templates", e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
