import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Input, Label } from "@repo/ui-admin";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams, useNavigate, Form } from "react-router";
import { SolapiSmsProvider } from "../../../.server/providers/SolapiSmsProvider";
import { format } from "date-fns";
import { ChevronRight, Search, X } from "lucide-react";
import { useState } from "react";

export async function loader({ params, request }: LoaderFunctionArgs) {
    const { profile } = params;
    if (!profile) throw new Error("Profile is required");

    const url = new URL(request.url);
    const startKey = url.searchParams.get("startKey") || undefined;
    const limit = Number(url.searchParams.get("limit")) || 20;

    // Filters
    const startDate = url.searchParams.get("startDate") || undefined;
    const endDate = url.searchParams.get("endDate") || undefined;

    const provider = new SolapiSmsProvider(profile);
    const groups = await provider.getGroups({
        limit,
        startKey,
        startDate,
        endDate
    });
    
    return { 
        groups,
        filters: { startDate, endDate }
    };
}

export default function SolapiDashboardHistoryGroup() {
    const { groups, filters } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key: string, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setLocalFilters({ startDate: undefined, endDate: undefined });
        navigate(".");
    };

    return (
        <div className="space-y-6">
            <div>
                 <h2 className="text-3xl font-bold tracking-tight text-foreground">Group History</h2>
                 <p className="text-gray-500 dark:text-gray-400">View message group logs.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-foreground">Search Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-end">
                        <div className="space-y-2">
                             <Label htmlFor="startDate">Start Date</Label>
                             <Input 
                                type="datetime-local" 
                                id="startDate" 
                                name="startDate"
                                value={localFilters.startDate || ""}
                                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                             />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="endDate">End Date</Label>
                             <Input 
                                type="datetime-local" 
                                id="endDate" 
                                name="endDate"
                                value={localFilters.endDate || ""}
                                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                             />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1">
                                <Search className="mr-2 h-4 w-4" /> Search
                            </Button>
                            <Button type="button" variant="outline" onClick={clearFilters}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-foreground">Message Groups</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">Date</TableHead>
                                    <TableHead className="min-w-[200px]">Group ID</TableHead>
                                    <TableHead className="min-w-[100px]">Status</TableHead>
                                    <TableHead className="min-w-[100px] text-right">Total</TableHead>
                                    <TableHead className="min-w-[100px] text-right">Sent</TableHead>
                                    <TableHead className="min-w-[100px] text-right">Failed</TableHead>
                                    <TableHead className="min-w-[120px] text-right">Cost (KRW)</TableHead>
                                    <TableHead className="min-w-[150px]">SDK Version</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(groups.groupList).map(([id, group]: [string, any]) => (
                                    <TableRow key={id}>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {group.dateCreated ? format(new Date(group.dateCreated), "yyyy-MM-dd HH:mm:ss") : "-"}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{group.groupId}</TableCell>
                                        <TableCell>
                                             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                                ${group.status === "SENDING" || group.status === "COMPLETE" ? "bg-green-100 text-green-700" : 
                                                  group.status === "FAILED" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
                                            >
                                                {group.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">{group.count.total.toLocaleString('ko-KR')}</TableCell>
                                        <TableCell className="text-right">{group.count.sentTotal.toLocaleString('ko-KR')}</TableCell>
                                        <TableCell className="text-right text-red-600">{group.count.sentFailed.toLocaleString('ko-KR')}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {(group.balance?.sum || 0).toLocaleString('ko-KR')}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {group.sdkVersion || "-"} / {group.osPlatform || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {Object.keys(groups.groupList).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                            No groups found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button 
                            variant="outline" 
                            size="sm"
                            disabled={!groups.nextKey}
                            onClick={() => {
                                if (groups.nextKey) {
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.set("startKey", groups.nextKey);
                                    navigate(`?${newParams.toString()}`);
                                }
                            }}
                        >
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
