import { useAuthServerContext } from "@repo/auth/server";
import { sendEmail } from "../../member/utils/email.server";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.member.list"])) {
    return Response.json({ success: false, error: "Permission denied" }, { status: 403 });
  }

  const formData = await request.formData();
  const recipientsJSON = formData.get("recipients") as string;
  let recipients: { email: string | null }[] = [];
  if (recipientsJSON) {
      try {
          recipients = JSON.parse(recipientsJSON);
      } catch (e) {
          // ignore parsing error or handle
      }
  }

  const subject = formData.get("subject") as string;
  const html = formData.get("html") as string;

  if (!subject || !html) {
    return Response.json({ success: false, error: "Subject and Body are required" }, { status: 400 });
  }

  const emails = recipients.map(r => r.email).filter(Boolean) as string[];

  // De-duplicate emails
  const uniqueEmails = Array.from(new Set(emails));

  if (uniqueEmails.length === 0) {
      return Response.json({ success: false, error: "No valid email recipients found" }, { status: 400 });
  }

  try {      
      const emailPromises = uniqueEmails.map(to => sendEmail({ to, subject, html }));
      await Promise.all(emailPromises);

  } catch (e: any) {
    console.error("Email Send Error", e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }

  return Response.json({ success: true, sentCount: uniqueEmails.length });
}
