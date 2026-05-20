import { Button, Card, CardContent, Input, Label, Textarea } from "@repo/ui-admin";
import * as fs from "fs";
import { Send } from "lucide-react";
import * as os from "os";
import * as path from "path";
import { Form, useActionData, useNavigation, type ActionFunctionArgs } from "react-router";
import { SolapiSmsProvider } from "../../../../.server/providers/SolapiSmsProvider";

import { getErrorMessage } from "@repo/core/utils";
// 권한 가드는 admin-layout backstop 에서 처리 (순환의존 회피)
export async function action({ request, params }: ActionFunctionArgs) {
  const { profile } = params;
  if (!profile) throw new Error("Profile is required");

  const formData = await request.formData();
  const testPhone = formData.get("testPhone") as string;
  const title = formData.get("title") as string;
  const text = formData.get("text") as string;
  const imageFile = formData.get("image") as File | null;

  if (!testPhone || !text || !title) return { error: "Phone, Title, and Message are required" };

  let tempFilePath: string | undefined;

  try {
      const sender = new SolapiSmsProvider(profile);
      let imageId: string | undefined;

      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
          const tempDir = os.tmpdir();
          tempFilePath = path.join(tempDir, `sms-upload-${Date.now()}-${imageFile.name}`);
          const buffer = Buffer.from(await imageFile.arrayBuffer());
          fs.writeFileSync(tempFilePath, buffer);
          
          imageId = await sender.uploadFile(tempFilePath, "MMS");
      }

      await sender.sendMMS({ to: testPhone, title, text, imageUrls: [], imageId });
      
      // Clean up after success
      if (tempFilePath) {
         try { fs.unlinkSync(tempFilePath); } catch (e) {}
      }

      return { success: true, message: `MMS sent to ${testPhone} (Solapi)` + (imageId ? " with image" : "") };

  } catch (e) {
      // Clean up after error
      if (tempFilePath) {
        try { fs.unlinkSync(tempFilePath); } catch (e) {}
      }
      return { error: getErrorMessage(e) };
  }
}

export default function SolapiMmsTestPage() {
  const actionData = useActionData<{ success?: boolean; error?: string; message?: string }>();
  const navigation = useNavigation();
  const isSending = navigation.state === "submitting";

  return (
    <div className="space-y-6 max-w-2xl">
         <div>
             <h2 className="text-2xl font-bold tracking-tight text-foreground">Send MMS</h2>
             <p className="text-muted-foreground">Send an MMS via Solapi.</p>
         </div>

         {actionData?.success && (
            <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md">
                {actionData.message}
            </div>
        )}
        
        {actionData?.error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
                {actionData.error}
            </div>
        )}

         <Card>
             <CardContent className="pt-6">
                <Form method="post" encType="multipart/form-data" className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-foreground">Phone Number</Label>
                        <Input name="testPhone" placeholder="01012345678" required className="text-foreground bg-transparent" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-foreground">Title</Label>
                        <Input name="title" placeholder="Message Title" required className="text-foreground bg-transparent" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-foreground">Message</Label>
                        <Textarea name="text" placeholder="Type your message..." required className="h-32 text-foreground bg-transparent" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-foreground">Image (Optional)</Label>
                        <Input type="file" name="image" accept="image/*" className="text-foreground bg-transparent" />
                        <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF. Max 300KB for typical carriers.</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSending}>
                        {isSending ? "Sending..." : <><Send className="w-4 h-4 mr-2"/> Send MMS</>}
                    </Button>
                </Form>
             </CardContent>
         </Card>
    </div>
  );
}
