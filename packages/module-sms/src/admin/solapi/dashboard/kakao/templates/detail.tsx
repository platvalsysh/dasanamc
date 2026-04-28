import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, Form, useNavigate, useActionData, useParams } from "react-router";
import { SolapiSmsProvider } from "../../../../../.server/providers/SolapiSmsProvider";
import { KakaoMessageTypeMap, KakaoTemplateStatusMap, KakaoEmphasizeTypeMap, KakaoButtonTypeMap } from "./constants";
import { Button } from "@repo/ui-admin/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui-admin/components/ui/card";
import { Badge } from "@repo/ui-admin/components/ui/badge";
import { AlertCircle, CheckCircle2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui-admin/components/ui/dialog";
import { Input } from "@repo/ui-admin/components/ui/input";
import { Label } from "@repo/ui-admin/components/ui/label";
import { useState, useEffect } from "react";

import { getErrorMessage } from "@repo/core/utils";
export async function loader({ params }: LoaderFunctionArgs) {
  const { profile, templateId } = params;
  if (!profile || !templateId) throw new Error("Profile and Template ID are required");
  
  const provider = new SolapiSmsProvider(profile);
  const service = await provider.getService();
  const template = await service.getKakaoAlimtalkTemplate(templateId);
  
  return { template };
}

export async function action({ request, params }: ActionFunctionArgs) {
    const { profile, templateId } = params;
    if (!profile || !templateId) throw new Error("Required params missing");

    const formData = await request.formData();
    const intent = formData.get("intent") as string;
    
    const provider = new SolapiSmsProvider(profile);

    try {
        if (intent === "inspect") {
             await provider.requestKakaoTemplateInspection(templateId);
             return { success: "Inspection requested successfully." };
        } else if (intent === "delete") {
             const service = await provider.getService();
             await service.removeKakaoAlimtalkTemplate(templateId);
             return { deleted: true };
        } else if (intent === "updateName") {
             const name = formData.get("name") as string;
             if (!name) return { error: "Name is required" };
             
             const service = await provider.getService();
             await service.updateKakaoAlimtalkTemplateName(templateId, name);
             
             return { success: "Template name updated successfully." };
        }
    } catch (e) {
        console.error("Action failed", e);
        return { error: getErrorMessage(e) || "Action failed" };
    }
    return null;
}

export default function SolapiKakaoTemplateDetail() {
  const { template } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ error?: string, success?: string, deleted?: boolean }>();
  const navigate = useNavigate();
  const { profile, channelId } = useParams();
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
      if (actionData?.success && isEditOpen) {
          setIsEditOpen(false);
      }
  }, [actionData, isEditOpen]);

  if (actionData?.deleted) {
      // Effect to redirect would be better, but quick inline check works for now or just standard redirect from action
      // Since we returned JSON, we handle it here
      setTimeout(() => navigate(`/admin/sms/solapi/dashboard/${profile}/kakao/channels/${channelId}/templates`), 100); // Simple redirect
      return null;
  }

  const extractedVariables = Array.from(
    (template.content || "").matchAll(/#\{([^{}]+)\}/g)
  ).map(m => m[1]);

  const uniqueVariables = Array.from(new Set([...extractedVariables]));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
         <div className="space-y-1">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    {template.name}
                    <Badge variant={template.status === "APPROVED" ? "default" : "outline"}>{template.status}</Badge>
                </h3>
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Pencil className="h-3 w-3" />
                            <span className="sr-only">Edit Name</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Template Name</DialogTitle>
                            <DialogDescription>
                                Update the name of this AlimTalk template.
                            </DialogDescription>
                        </DialogHeader>
                        <Form method="post">
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={template.name}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <input type="hidden" name="intent" value="updateName" />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
            <p className="text-sm text-muted-foreground">ID: {template.templateId}</p>
         </div>
         <div className="flex gap-2">
             <Button variant="outline" onClick={() => navigate(`/admin/sms/solapi/dashboard/${profile}/kakao/channels/${channelId}/templates`)}>Back to List</Button>
             <Form method="post" onSubmit={(e) => !confirm("Are you sure you want to delete this template?") && e.preventDefault()}>
                 <input type="hidden" name="intent" value="delete" />
                 <Button variant="destructive" type="submit">Delete</Button>
             </Form>
         </div>
      </div>

      {actionData?.error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <div className="text-sm font-medium">Error: {actionData.error}</div>
        </div>
      )}

      {actionData?.success && (
        <div className="bg-green-50 text-green-600 border border-green-200 p-3 rounded-md flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <div className="text-sm font-medium">Success: {actionData.success}</div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
          <Card>
              <CardHeader>
                  <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap bg-muted/30 p-4 rounded-md text-sm">
                  {template.content}
                  
                  {template.extra && (
                    <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold mb-2 text-xs text-muted-foreground uppercase">Extra Content</h4>
                        <div>{template.extra}</div>
                    </div>
                  )}

                  {template.ad && (
                    <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold mb-2 text-xs text-muted-foreground uppercase">Ad Content</h4>
                        <div>{template.ad}</div>
                    </div>
                  )}
              </CardContent>
          </Card>

          <div className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                      {/* <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-muted-foreground">Category</span>
                          <span className="col-span-2">{template.categoryCode}</span>
                      </div> */}
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <h4 className="font-semibold mb-1">Status</h4>
                 <Badge variant={
                     template.status === "APPROVED" ? "default" : 
                     template.status === "REJECTED" ? "destructive" : "secondary"
                 }>
                   {KakaoTemplateStatusMap[template.status] || template.status}
                 </Badge>
               </div>
               <div>
                 <h4 className="font-semibold mb-1">Inspection Status</h4>
                  <span>{KakaoTemplateStatusMap[template.status] || template.status}</span> 
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <h4 className="font-semibold mb-1">Channel ID</h4>
                 <p>{template.channelId || "-"}</p>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <h4 className="font-semibold mb-1">Message Type</h4>
                 <p>{KakaoMessageTypeMap[template.messageType || "BA"] || template.messageType}</p>
               </div>
               <div>
                 <h4 className="font-semibold mb-1">Emphasize Type</h4>
                 <p>{KakaoEmphasizeTypeMap[template.emphasizeType || "NONE"] || template.emphasizeType}</p>
               </div>
             </div>

             {template.imageId && (
                <div>
                    <h4 className="font-semibold mb-1">Image ID</h4>
                    <p className="text-xs truncate" title={template.imageId}>{template.imageId}</p>
                </div>
             )}

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <h4 className="font-semibold mb-1">Created At</h4>
                 <p>{new Date(template.dateCreated).toLocaleString()}</p>
               </div>
               <div>
                  <h4 className="font-semibold mb-1">Updated At</h4>
                  <p>{template.dateUpdated ? new Date(template.dateUpdated).toLocaleString() : "-"}</p>
               </div>
             </div>
                      
                      <div className="pt-4 border-t">
                           <h4 className="font-medium mb-2">Inspection Actions</h4>
                           <div className="flex items-center gap-2">
                               {/* Use template.status for inspection status check */}
                               {template.status !== "APPROVED" && template.status !== "INSPECTING" && (
                                   <Form method="post">
                                       <input type="hidden" name="intent" value="inspect" />
                                       <Button size="sm" type="submit">Request Inspection</Button>
                                   </Form>
                               )}
                           </div>
                      </div>
                  </CardContent>
              </Card>

              {template.buttons && template.buttons.length > 0 && (
                  <Card>
                      <CardHeader>
                          <CardTitle>Buttons</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <ul className="space-y-3">
                              {template.buttons.map((btn, idx: number) => (
                                  <li key={idx} className="p-3 border rounded text-sm bg-background">
                                      <div className="flex justify-between items-start mb-1">
                                          <div className="font-medium">{btn.buttonName}</div>
                                          <Badge variant="outline" className="text-xs">{KakaoButtonTypeMap[btn.buttonType] || btn.buttonType}</Badge>
                                      </div>
                                      <div className="text-xs text-muted-foreground space-y-0.5">
                                          {btn.linkMo && <div>MO: {btn.linkMo}</div>}
                                          {btn.linkPc && <div>PC: {btn.linkPc}</div>}
                                          {btn.linkAnd && <div>Android: {btn.linkAnd}</div>}
                                          {btn.linkIos && <div>iOS: {btn.linkIos}</div>}
                                      </div>
                                  </li>
                              ))}
                          </ul>
                      </CardContent>
                  </Card>
              )}

              {uniqueVariables.length > 0 && (
                  <Card>
                      <CardHeader>
                          <CardTitle>Variables (변수)</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <div className="flex flex-wrap gap-2">
                              {uniqueVariables.map((v, idx) => (
                                  <Badge key={idx} variant="secondary" className="font-mono">
                                      {`#{${v}}`}
                                  </Badge>
                              ))}
                          </div>
                      </CardContent>
                  </Card>
              )}

              {template.comments && template.comments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Inspection History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {template.comments.map((comment, idx: number) => (
                                <li key={idx} className="text-sm border-b pb-3 last:border-0 last:pb-0">
                                    <div className="mb-1 font-medium flex justify-between">
                                        <span>{comment.isAdmin ? "Admin" : "User"}</span>
                                        <span className="text-xs text-muted-foreground">{new Date(comment.dateCreated).toLocaleString()}</span>
                                    </div>
                                    <div className="text-muted-foreground whitespace-pre-wrap">{comment.content}</div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
              )}
          </div>
      </div>
    </div>
  );
}
