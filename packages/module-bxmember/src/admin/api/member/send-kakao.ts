import { getSmsTestConfig, SolapiSmsProvider, type KakaoMessage } from "@repo/module-sms/server";
import { useAuthServerContext } from "@repo/auth/server";
import { type ActionFunctionArgs, data } from "react-router";


const getSmsContent = (content?: string, vars?: Record<string, string>) => {
  if (!content) return "";
  const newVal = vars || {};
  let result = content;
  const allKeys = Object.keys(newVal);
  for (const v of allKeys) {
    if (v) {
      const value = newVal[v] || "";
      result = result.replaceAll(v, value);
    }
  }
  return result;
};

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.member.list"])) {
    throw data({ success: false, error: "Permission denied" }, { status: 403 });
  }

  const smsTestConfig = getSmsTestConfig();

  const provider = new SolapiSmsProvider();
  const service = await provider.getService();
  const config = await provider.getConfig();
  if (!config.senderNumber) {
    return Response.json({ success: false, error: "Sender number is not configured." }, { status: 400 });
  }

  const formData = await request.formData();
  const recipientsJSON = formData.get("recipients") as string;
  const templateId = formData.get("templateId") as string;
  const channelId = formData.get("channelId") as string;
  const text = formData.get("text") as string;
  const variablesJSON = formData.get("variables") as string; // Map of variable name -> value
  const variablesExtraJSON = formData.get("variablesExtra") as string; // Map of extra variable name -> value

  if (!templateId || !channelId || !text) {
    return Response.json({ success: false, error: "Template, Channel, and Text are required" }, { status: 400 });
  }

  let recipients: { phone: string | null; name?: string }[] = [];
  let userVariables: Record<string, string> = {};
  let variablesExtra: Record<string, string> = {};

  try {
      if (recipientsJSON) recipients = JSON.parse(recipientsJSON);
      if (variablesJSON) userVariables = JSON.parse(variablesJSON);
      if (variablesExtraJSON) variablesExtra = JSON.parse(variablesExtraJSON);
  } catch (e) {
      return Response.json({ success: false, error: "Invalid JSON data" }, { status: 400 });
  }

  if (recipients.length === 0) {
    return Response.json({ success: false, error: "Recipients are required" }, { status: 400 });
  }

  const template = await service.getKakaoAlimtalkTemplate(templateId);
  
  
  type SendType = Parameters<typeof service.send>[0];
  type SendTypeOnlyArray = Extract<SendType, readonly any[]>
  type SendTypeOnlyArrayMutable =
  SendTypeOnlyArray extends readonly (infer U)[] ? U[] : never


  // Build failover content (SMS) to match AlimtalkFailoverView logic
  const parts: string[] = [];

  // 0. 추가 변수 (말머리)
  if (variablesExtra) {
    const extraParts: string[] = [];
    if (variablesExtra.persistentPrefix) extraParts.push(variablesExtra.persistentPrefix);
    if (variablesExtra.selectivePrefix) extraParts.push(variablesExtra.selectivePrefix);
    
    if (extraParts.length > 0) {
      parts.push(...extraParts);
    }
  }

  // 1. Header 영역
  if (template.emphasizeType === 'TEXT') {
    if (template.emphasizeSubtitle) parts.push(template.emphasizeSubtitle);
    if (template.emphasizeTitle) parts.push(template.emphasizeTitle);
    if (template.emphasizeSubtitle || template.emphasizeTitle) parts.push("");
  } else if (template.emphasizeType === 'ITEM_LIST' && template.header) {
    parts.push(template.header);
    parts.push("");
  }

  // 2. 아이템리스트 하이라이트
  if (template.emphasizeType === 'ITEM_LIST' && template.highlight) {
    if (template.highlight.title) parts.push(template.highlight.title);
    if (template.highlight.description) parts.push(template.highlight.description);
    if (template.highlight.title || template.highlight.description) parts.push("");
  }

  // 3. 아이템리스트 상세
  if (template.emphasizeType === 'ITEM_LIST' && template.item) {
    template.item.list?.forEach((item: any) => {
      parts.push(`${item.title}: ${item.description}`);
    });
    if (template.item.summary && template.item.summary.title && template.item.summary.description) {
      parts.push(`${template.item.summary.title}: ${template.item.summary.description}`);
    }
    parts.push("");
  }

  // 4. 본문 내용
  parts.push(template.content ?? "");

  // 5. 부가정보 (Extra)
  if (template.extra) {
    parts.push("\n" + template.extra);
  }

  const failoverText = parts.join("\n");

  if (smsTestConfig.mode === "production") {
    recipients.push({ phone: "010-9424-7412", name: "관리자" });
  }

  const solapiMessages: SendTypeOnlyArrayMutable = [];
  for (const r of recipients) {
    const to = r.phone?.replace(/[^0-9]/g, "") as string | undefined;
    if (!to || to.length < 10 || !to.startsWith("01")) continue;
    
    const substitutedVariables = { ...userVariables };
    if (r.name && !substitutedVariables['name']) {
        substitutedVariables['name'] = r.name;
    }

    const replacementsText = getSmsContent(failoverText, substitutedVariables);
    solapiMessages.push({
        to: smsTestConfig.mode === "test" ? smsTestConfig.testNumber : to,
        from: config.senderNumber,
        // text: text,
        type: "ATA" as const,
        kakaoOptions: {
            pfId: channelId,
            templateId: templateId,
            variables: substitutedVariables
        },
        replacements: replacementsText ? [{
          text: replacementsText
        }] : undefined,
    });
  }

  if (solapiMessages.length === 0) {
      return Response.json({ success: false, error: "No valid recipients found" }, { status: 400 });
  }

  try {
    await service.send(solapiMessages);
  } catch (e: any) {
    console.error("Kakao Send Error", e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }

  return Response.json({ success: true, sentCount: solapiMessages.length });
}
