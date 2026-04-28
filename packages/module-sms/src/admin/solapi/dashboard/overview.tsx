import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui-admin";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { SolapiSmsProvider } from "../../../.server/providers/SolapiSmsProvider";

export async function loader({ params }: LoaderFunctionArgs) {
    const { profile } = params;
    if (!profile) throw new Error("Profile is required");

    const provider = new SolapiSmsProvider(profile);
    const profileData = await provider.getProfile();
    const balance = await provider.getBalance();
    
    return { 
        profileName: profileData.name,
        config: profileData.config,
        balance
    };
}

export default function SolapiDashboardOverview() {
    const { profileName, config, balance } = useLoaderData<typeof loader>();

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
                         <div className="text-2xl font-bold uppercase text-foreground">SOLAPI</div>
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

            <div className="grid gap-4 md:grid-cols-1">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-foreground">SOLAPI Status</CardTitle>
                         <CardDescription className="text-gray-500 dark:text-gray-400">Real-time usage and balance information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                             <div className="flex justify-between">
                                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance</span>
                                 <span className="text-lg font-bold text-foreground">{balance.balance.toLocaleString('ko-KR')} KRW</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Points</span>
                                 <span className="text-lg font-bold text-foreground">{balance.point.toLocaleString('ko-KR')} P</span>
                             </div>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
}
