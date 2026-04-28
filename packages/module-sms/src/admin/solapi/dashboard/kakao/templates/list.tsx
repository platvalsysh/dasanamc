import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, NavLink, useNavigate, Form } from "react-router";
import { SolapiSmsProvider } from "../../../../../.server/providers/SolapiSmsProvider";
import { Badge } from "@repo/ui-admin/components/ui/badge";
import { Button } from "@repo/ui-admin/components/ui/button";
import { KakaoMessageTypeMap, KakaoTemplateStatusMap } from "./constants";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui-admin/components/ui/table";
import { Plus, Search } from "lucide-react";
import { Input } from "@repo/ui-admin/components/ui/input";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { profile, channelId } = params;
  if (!profile || !channelId) throw new Error("Profile and Channel ID are required");
  
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const name = url.searchParams.get("name") || undefined;
  
  const provider = new SolapiSmsProvider(profile);
    const service = await provider.getService();
    const result = await service.getKakaoAlimtalkTemplates({ 
      status: status as any, 
      name, 
      channelId,
      limit: 100 
    });
    const templates = result.templateList;
  
  return { templates, status, search: name, channelId };
}

export default function KakaoTemplateList() {
  const { templates, status, search, channelId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const templateList = templates || [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h3 className="text-lg font-medium">AlimTalk Templates</h3>
           <p className="text-sm text-muted-foreground">
               Manage your AlimTalk templates here.
               <span className="block text-primary">Channel: {channelId}</span>
           </p>
        </div>
        <Button asChild>
            <NavLink to="new">
                <Plus className="mr-2 h-4 w-4" /> Create Template
            </NavLink>
        </Button>
      </div>

      <Card>
        <CardHeader>
           <div className="flex items-center justify-between">
             <CardTitle>Template List</CardTitle>
             <Form className="flex gap-2 items-center">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        name="name" 
                        placeholder="Search by name..." 
                        defaultValue={search} 
                        className="w-[250px] pl-8"
                    />
                </div>
                 <select 
                    name="status" 
                    className="h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue={status}
                 >
                    <option value="">All Status</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                 </select>
                 <Button type="submit" variant="secondary" size="sm">Search</Button>
             </Form>
           </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Message Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Buttons</TableHead>
                <TableHead>Date Created</TableHead>
                 <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templateList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                     No templates found.
                  </TableCell>
                </TableRow>
              ) : (
                templateList.map((template) => (
                  <TableRow 
                    key={template.templateId} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(template.templateId)}
                  >
                    <TableCell className="font-medium">{template.templateId}</TableCell>
                    <TableCell>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-50">{template.content}</div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{KakaoMessageTypeMap[template.messageType || "BA"] || template.messageType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                          template.status === "APPROVED" ? "default" : 
                          template.status === "REJECTED" ? "destructive" : "secondary"
                      }>
                        {KakaoTemplateStatusMap[template.status] || template.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{template.buttons?.length || 0}</TableCell>
                    <TableCell>{template.dateCreated ? new Date(template.dateCreated).toLocaleDateString() : "-"}</TableCell>
                     <TableCell>
                      <Button asChild variant="ghost" size="sm">
                          <NavLink to={template.templateId}>View</NavLink>
                      </Button>
                     </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
