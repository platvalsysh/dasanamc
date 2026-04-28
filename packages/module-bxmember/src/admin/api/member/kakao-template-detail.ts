import { SolapiSmsProvider } from "@repo/module-sms/server";
import { useAuthServerContext } from "@repo/auth/server";
import { type ActionFunctionArgs, data } from "react-router";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.member.list"])) {
    throw data({ success: false, error: "Permission denied" }, { status: 403 });
  }

  const formData = await request.formData();
  const templateId = formData.get("templateId") as string;

  if (!templateId) {
    return Response.json({ success: false, error: "Template ID is required" }, { status: 400 });
  }

  const provider = new SolapiSmsProvider();
  
  try {
    const service = await provider.getService();
    const template = await service.getKakaoAlimtalkTemplate(templateId) as any;

    // 이미지 정보 추가 조회 (이미지형 또는 하이라이트 이미지)
    if (template.imageId) {
      try {
        const fileInfo = await provider.getFile(template.imageId);
        template.imageUrl = fileInfo.url;
      } catch (err) {
        console.warn(`Failed to fetch image info for ${template.imageId}`, err);
      }
    }

    if (template.highlight?.imageId) {
      try {
        const fileInfo = await provider.getFile(template.highlight.imageId);
        template.highlightImageUrl = fileInfo.url;
      } catch (err) {
        console.warn(`Failed to fetch highlight image info for ${template.highlight.imageId}`, err);
      }
    }

    return Response.json({ success: true, template });
  } catch (e: any) {
    console.error(`Failed to fetch Kakao template detail for ${templateId}`, e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
