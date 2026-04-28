import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { ConsoleSmsProvider } from "../../../.server/providers/ConsoleSmsProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui-admin";

export async function loader({ params }: LoaderFunctionArgs) {
    const { profile } = params;
    if (!profile) throw new Error("Profile is required");

    const provider = new ConsoleSmsProvider(profile);
    const profileData = await provider.getProfile();
    
    return { 
        profileName: profileData.name,
        config: profileData.config
    };
}

export default function ConsoleDashboardOverview() {
    const { profileName, config } = useLoaderData<typeof loader>();

    return (
        <div className="space-y-6">
            <div>
                 <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
                 <p className="text-muted-foreground">Welcome to the {profileName} dashboard.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium text-foreground">Provider</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <div className="text-2xl font-bold uppercase text-foreground">CONSOLE</div>
                     </CardContent>
                 </Card>
                 <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium text-foreground">Default Sender</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <div className="text-2xl font-bold text-foreground">{config.senderNumber || "-"}</div>
                     </CardContent>
                 </Card>
            </div>
        </div>
    );
}
