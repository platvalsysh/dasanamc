import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData, Form, redirect, useActionData, useNavigate } from "react-router";
import { SolapiSmsProvider } from "../../../../../.server/providers/SolapiSmsProvider";
import { Button } from "@repo/ui-admin/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui-admin/components/ui/card";
import { Input } from "@repo/ui-admin/components/ui/input";
import { Label } from "@repo/ui-admin/components/ui/label";
import { Textarea } from "@repo/ui-admin/components/ui/textarea";
import { AlertCircle } from "lucide-react";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { profile, channelId } = params;
  if (!profile || !channelId) throw new Error("Profile and Channel ID are required");
  
  const provider = new SolapiSmsProvider(profile);
  
  // Fetch channels to select from
    const service = await provider.getService();
    const result = await service.getKakaoChannels();
    const channels = result.channelList || [];

  // Fetch categories
    const categories = await service.getKakaoAlimtalkTemplateCategories();

  return { channels, categories, channelId };
}

export async function action({ request, params }: ActionFunctionArgs) {
    const { profile, channelId } = params;
    if (!profile || !channelId) throw new Error("Profile and Channel ID are required");

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const content = formData.get("content") as string;
    const categoryCode = formData.get("categoryCode") as string;
    
    if (!name || !content || !categoryCode) {
        return { error: "All fields are required" };
    }

    const provider = new SolapiSmsProvider(profile);

    try {
        const service = await provider.getService(); 
        await service.createKakaoAlimtalkTemplate({ 
            name,
            content,
            channelId, 
            categoryCode,
            buttons: [], 
            messageType: "BA", 
            emphasizeType: "NONE",
            securityFlag: false
        });
        return redirect(`/admin/sms/solapi/dashboard/${profile}/kakao/channels/${channelId}/templates`);
    } catch (e: any) {
        console.error("Failed to create template", e);
        return { error: e.message || "Failed to create template" };
    }
}

export default function NewTemplate() {
  const { channels, categories, channelId } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ error?: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState("");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <h3 className="text-lg font-medium">Create New Template</h3>
         <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
      </div>

      {actionData?.error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <div className="text-sm font-medium">Error: {actionData.error}</div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>
             Define the content for your AlimTalk template.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="channelId">Channel (Sender)</Label>
                <select 
                    id="channelId"
                    name="channelId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    defaultValue={channelId}
                    disabled
                >
                    <option value="">Select a channel...</option>
                    {channels.map((c: any) => (
                        <option key={c.channelId} value={c.channelId}>{c.channelId} ({c.phoneNumber})</option>
                    ))}
                </select>
                <input type="hidden" name="channelId" value={channelId} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="categoryCode">Category</Label>
                 <select 
                    id="categoryCode"
                    name="categoryCode"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                >
                    <option value="">Select a category...</option>
                    {categories.length > 0 ? categories.map((c: any) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                    )) : (
                        <option value="001001">Shipping Info (Fallback)</option>
                    )}
                </select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input id="name" name="name" placeholder="e.g. Order Confirmation" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea 
                    id="content" 
                    name="content" 
                    placeholder="Enter template content. Variables can be used like #{name}." 
                    className="min-h-37.5"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required 
                />
                <p className="text-xs text-muted-foreground text-right">
                    {content.length} characters
                </p>
            </div>

            <div className="pt-4">
                <Button type="submit" className="w-full">Create Template</Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
