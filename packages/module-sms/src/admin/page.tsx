import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useLoaderData, useActionData, NavLink } from "react-router";
import { smsService } from "../.server/SmsService";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  Input,
  Label,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui-admin";
import { Plus, Trash2, LayoutDashboard } from "lucide-react";
import { useState } from "react";

import { getSmsModuleConfig, addSmsProfile, deleteSmsProfile, setDefaultSmsProfile } from "../.server/config";

export async function loader({ request }: LoaderFunctionArgs) {
  const config = await getSmsModuleConfig();
  const supportedProviders = smsService.getSupportedProviders();
  return { config, supportedProviders };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "add_profile") {
      const name = formData.get("name") as string;
      const provider = formData.get("provider") as string;

      if (!name || !provider) {
        return { error: "Name and Provider are required" };
      }

      await addSmsProfile(name, provider, { senderNumber: "" });
      return { success: true };
    }
    
    if (intent === "delete_profile") {
        const name = formData.get("name") as string;
        await deleteSmsProfile(name);
    } else if (intent === "set_default") {
        const name = formData.get("name") as string;
        await setDefaultSmsProfile(name);
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export default function SmsAdminPage() {
  const { config, supportedProviders } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const [isAdding, setIsAdding] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState<string | null>(null);

  const profiles = config?.profiles || {};
  const defaultProfile = config?.defaultProfile;

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">SMS Configuration</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage SMS providers and profiles.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="mr-2 h-4 w-4" /> Add Profile
        </Button>
      </div>

      {actionData?.error && (
        <div className="bg-destructive/15 text-destructive border-destructive/20 border p-4">
           {actionData.error}
        </div>
      )}

      {isAdding && (
        <Card className="border-dashed border-2">
            <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">New Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <Form method="post" className="space-y-4" onSubmit={() => setIsAdding(false)}>
                    <input type="hidden" name="intent" value="add_profile" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-700 dark:text-gray-300">Profile Name</Label>
                            <Input name="name" placeholder="e.g. marketing" required className="text-gray-900 dark:text-gray-100 bg-transparent" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-700 dark:text-gray-300">Provider</Label>
                            <Select name="provider" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    {supportedProviders.map((p: string) => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="text-gray-700 dark:text-gray-300">Cancel</Button>
                        <Button type="submit">Create Profile</Button>
                    </div>
                </Form>
            </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(profiles).map(([name, profile]) => (
          <Card key={name} className={defaultProfile === name ? "border-primary" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold capitalize text-gray-900 dark:text-gray-100">
                {name}
                {defaultProfile === name && (
                    <Badge variant="default" className="ml-2">Default</Badge>
                )}
              </CardTitle>
              {/* Allow deleting even if default, action handles re-assignment */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setDeletingProfile(name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Provider:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{profile.provider}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Sender:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{profile.config?.senderNumber || "Not Configured"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 items-stretch">
                <div className="flex gap-2 w-full">
                     <Button variant="outline" size="sm" className="flex-1" asChild>
                         <NavLink to={`/admin/sms/${profile.provider}/setting/${name}`}>Settings</NavLink>
                     </Button>
                     <Button variant="secondary" size="sm" className="flex-1" asChild>
                        <NavLink to={`/admin/sms/${profile.provider}/dashboard/${name}/overview`}>
                             <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                        </NavLink>
                    </Button>
                </div>

                {defaultProfile !== name && (
                     <Form method="post" className="w-full">
                        <input type="hidden" name="intent" value="set_default" />
                        <input type="hidden" name="name" value={name} />
                        <Button variant="ghost" size="sm" type="submit" className="w-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Set as Default</Button>
                     </Form>
                )}
                {defaultProfile === name && (
                    <div className="w-full text-center text-xs text-gray-500 dark:text-gray-400 py-2">
                        Currently Default
                    </div>
                )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {Object.keys(profiles).length === 0 && !isAdding && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              No profiles configured. Click "Add Profile" to get started.
          </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingProfile} onOpenChange={(open) => !open && setDeletingProfile(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Delete Profile</DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete profile <strong>{deletingProfile}</strong>? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setDeletingProfile(null)} className="text-gray-700 dark:text-gray-300">Cancel</Button>
                <Form method="post" onSubmit={() => setDeletingProfile(null)}>
                    <input type="hidden" name="intent" value="delete_profile" />
                    <input type="hidden" name="name" value={deletingProfile || ""} />
                    <Button variant="destructive" type="submit">Delete</Button>
                </Form>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
