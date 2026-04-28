import { smsService, getSmsTestConfig } from "@repo/module-sms/server";
import { useAuthServerContext } from "@repo/auth/server";
import { type ActionFunctionArgs, data } from "react-router";

import { getErrorMessage } from "@repo/core/utils";
export async function action({ request, context }: ActionFunctionArgs) {
    const auth = useAuthServerContext(context);
    if (!auth.checkPermissions(["organization.manage"])) {
        throw data({ success: false, error: "Permission denied" }, { status: 403 });
    }

    const smsTestConfig = getSmsTestConfig();
    
    const formData = await request.formData();
    const recipientsJSON = formData.get("recipients") as string;
    const text = formData.get("text") as string;

    if (!text) {
        return Response.json({ success: false, error: "Message text is required" }, { status: 400 });
    }

    let recipients: { phone: string | null }[] = [];

    if (recipientsJSON) {
        try {
            recipients = JSON.parse(recipientsJSON);
        } catch (e) {
            return Response.json({ success: false, error: "Invalid recipients data" }, { status: 400 });
        }
    } else {
        return Response.json({ success: false, error: "Recipients are required" }, { status: 400 });
    }

    // Filter valid numbers
    const validRecipients = recipients
        .map(r => r.phone?.replace(/[^0-9]/g, ""))
        .filter((p): p is string => !!(p && p.length >= 10 && p.startsWith("01")));

    if (validRecipients.length === 0) {
        return Response.json({ success: false, error: "No valid recipients found" }, { status: 400 });
    }
  
    const messages = validRecipients.map(to => ({
        to: smsTestConfig.mode === "test" ? smsTestConfig.testNumber : to,
        text,
    }));

    try {
        await smsService.sendMany(messages);
    } catch (e) {
        console.error("SMS Send Error", e);
        return Response.json({ success: false, error: getErrorMessage(e) }, { status: 500 });
    }

    return Response.json({ success: true, sentCount: validRecipients.length });
}
