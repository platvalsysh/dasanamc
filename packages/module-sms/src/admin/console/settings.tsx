import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useLoaderData, useNavigation, NavLink, redirect } from "react-router";
import { updateSmsProfileConfig, deleteSmsProfile } from "../../.server/config";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui-admin";
import { ConsoleSmsProvider } from "../../.server/providers/ConsoleSmsProvider";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useState } from "react";

// 권한 가드는 admin-layout backstop 에서 처리 (순환의존 회피)
export async function loader({ params }: LoaderFunctionArgs) {
  const { profile } = params;
  if (!profile) throw new Error("Profile is required");

  // Validate profile exists and is a console provider
  const provider = new ConsoleSmsProvider(profile);
  const profileConfig = await provider.getProfile();

  return { profileName: profileConfig.name, config: profileConfig.config };
}

export async function action({ request, params }: ActionFunctionArgs) {
    const { profile } = params;
    if (!profile) throw new Error("Profile is required");

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "save_settings") {
        const senderNumber = formData.get("senderNumber") as string;
        
        await updateSmsProfileConfig(profile, { senderNumber });
        return { success: true };
    }

    if (intent === "delete_profile") {
        await deleteSmsProfile(profile);
        return redirect("/admin/sms");
    }

    return {};
}

export default function ConsoleSettingsPage() {
  const { profileName, config } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting" && navigation.formData?.get("intent") === "save_settings";
  const isDeleting = navigation.state === "submitting" && navigation.formData?.get("intent") === "delete_profile";
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
            <NavLink to="/admin/sms">
                <ArrowLeft className="w-5 h-5" />
            </NavLink>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Console Profile Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">{profileName}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Configuration</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
                Configure settings for the Console provider. This provider outputs messages to the server logs.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
             <Form method="post" className="space-y-6">
                <input type="hidden" name="intent" value="save_settings" />
                
                <div className="space-y-2">
                    <Label htmlFor="senderNumber" className="text-gray-700 dark:text-gray-300">Sender Number (Default)</Label>
                    <Input 
                        id="senderNumber" 
                        name="senderNumber" 
                        defaultValue={config?.senderNumber || ""} 
                        placeholder="e.g. 01012345678" 
                        className="text-gray-900 dark:text-gray-100 bg-transparent"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">The default sender number to simulate sending from.</p>
                </div>

                <div className="flex justify-end border-t pt-6">
                    <Button type="submit" disabled={isSaving || isDeleting}>
                        {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                    </Button>
                </div>
             </Form>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
          <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">Delete this profile permanently.</CardDescription>
          </CardHeader>
          <CardContent>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                      <Button variant="destructive" disabled={isDeleting}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Profile
                      </Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle className="text-gray-900 dark:text-gray-100">Delete Profile</DialogTitle>
                          <DialogDescription className="text-gray-500 dark:text-gray-400">
                              Are you absolutely sure you want to delete profile <strong>{profileName}</strong>? This action cannot be undone.
                          </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="text-gray-700 dark:text-gray-300">Cancel</Button>
                           <Form method="post">
                                <input type="hidden" name="intent" value="delete_profile" />
                                <Button variant="destructive" type="submit" disabled={isDeleting}>
                                    Delete Profile
                                </Button>
                           </Form>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>
          </CardContent>
      </Card>
    </div>
  );
}
