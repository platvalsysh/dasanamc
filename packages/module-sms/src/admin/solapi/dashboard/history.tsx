import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Input, Label } from "@repo/ui-admin";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams, useNavigate, Form } from "react-router";
import { SolapiSmsProvider } from "../../../.server/providers/SolapiSmsProvider";
import { format } from "date-fns";
import { ChevronRight, Search, X } from "lucide-react";
import { getStatusMessage } from "../../../utils/solapi-status";
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
    const to = url.searchParams.get("to") || undefined;
    const from = url.searchParams.get("from") || undefined;
    const type = url.searchParams.get("type") || undefined;
    const statusCode = url.searchParams.get("statusCode") || undefined;

    const provider = new SolapiSmsProvider(profile);
    const messages = await provider.getMessages({
        limit,
        startKey,
        startDate,
        endDate,
        to,
        from,
        type,
        statusCode
    });
    
    return { 
        messages,
        filters: { startDate, endDate, to, from, type, statusCode }
    };
}

export default function SolapiDashboardHistory() {
    const { messages, filters } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Local state for form inputs to allow typing before submitting
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key: string, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setLocalFilters({ startDate: undefined, endDate: undefined, to: undefined, from: undefined, type: undefined, statusCode: undefined });
        navigate(".");
    };

    return (
        <div className="space-y-6">
            <div>
                 <h2 className="text-3xl font-bold tracking-tight text-foreground">Usage History</h2>
                 <p className="text-gray-500 dark:text-gray-400">View sent message logs with advanced filtering.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-foreground">Search Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-end">
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
                        <div className="space-y-2">
                             <Label htmlFor="to">To (Receiver)</Label>
                             <Input 
                                id="to" 
                                name="to" 
                                placeholder="01012345678"
                                value={localFilters.to || ""}
                                onChange={(e) => handleFilterChange("to", e.target.value)}
                             />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="from">From (Sender)</Label>
                             <Input 
                                id="from" 
                                name="from" 
                                placeholder="0212345678"
                                value={localFilters.from || ""}
                                onChange={(e) => handleFilterChange("from", e.target.value)}
                             />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="type">Type</Label>
                             <select 
                                id="type" 
                                name="type" 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={localFilters.type || ""}
                                onChange={(e) => handleFilterChange("type", e.target.value)}
                             >
                                 <option value="">All</option>
                                 <option value="SMS">SMS</option>
                                 <option value="LMS">LMS</option>
                                 <option value="MMS">MMS</option>
                                 <option value="ATA">AlimTalk (ATA)</option>
                             </select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="statusCode">Status Code</Label>
                             <Input 
                                id="statusCode" 
                                name="statusCode" 
                                placeholder="e.g. 2000" 
                                value={localFilters.statusCode || ""}
                                onChange={(e) => handleFilterChange("statusCode", e.target.value)}
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
                    <CardTitle className="text-foreground">Sent Messages</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">Date</TableHead>
                                    <TableHead className="min-w-[80px]">Type</TableHead>
                                    <TableHead className="min-w-[120px]">To</TableHead>
                                    <TableHead className="min-w-[120px]">From</TableHead>
                                    <TableHead className="min-w-[200px]">Status</TableHead>
                                    <TableHead className="min-w-[200px]">Message ID</TableHead>
                                    <TableHead className="min-w-[200px]">Group ID</TableHead>
                                    <TableHead className="min-w-[100px]">Country</TableHead>
                                    <TableHead className="min-w-[150px]">Subject</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(messages.messageList).map(([id, msg]: [string, any]) => (
                                    <TableRow key={id}>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {msg.dateCreated ? format(new Date(msg.dateCreated), "yyyy-MM-dd HH:mm:ss") : "-"}
                                        </TableCell>
                                        <TableCell>{msg.type}</TableCell>
                                        <TableCell>{msg.to}</TableCell>
                                        <TableCell>{msg.from}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit whitespace-nowrap
                                                    ${msg.statusCode === "2000" || msg.statusCode === "4000" ? "bg-green-100 text-green-700" : 
                                                      msg.statusCode === "3000" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}
                                                >
                                                    {getStatusMessage(msg.statusCode)}
                                                </span>
                                                {![ "2000", "3000", "4000" ].includes(msg.statusCode) && (
                                                    <span className="text-xs text-muted-foreground mt-1">Code: {msg.statusCode}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{msg.messageId}</TableCell>
                                        <TableCell className="font-mono text-xs">{msg.groupId}</TableCell>
                                        <TableCell>{msg.country || "-"}</TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={msg.subject}>{msg.subject || "-"}</TableCell>
                                    </TableRow>
                                ))}
                                {Object.keys(messages.messageList).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                            No messages found.
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
                            disabled={!messages.nextKey}
                            onClick={() => {
                                if (messages.nextKey) {
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.set("startKey", messages.nextKey);
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
