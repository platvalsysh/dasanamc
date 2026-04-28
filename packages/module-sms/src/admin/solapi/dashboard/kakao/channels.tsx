import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui-admin/components/ui/table";
import { Button } from "@repo/ui-admin/components/ui/button";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useParams, NavLink } from "react-router";
import { SolapiSmsProvider } from "../../../../.server/providers/SolapiSmsProvider";

export async function loader({ params }: LoaderFunctionArgs) {
  const { profile } = params;
  if (!profile) throw new Error("Profile is required");
  
  const provider = new SolapiSmsProvider(profile);
  const service = await provider.getService();
  const result = await service.getKakaoChannels();
  const channels = result.channelList || [];
  
  return { channels };
}

export default function SolapiKakaoChannels() {
  const { channels } = useLoaderData<typeof loader>();
  const { profile } = useParams();
  const channelList = channels || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">KakaoTalk Channels</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel List</CardTitle>
          <CardDescription>Manage your KakaoTalk channels (Plus Friends).</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel ID (pfId)</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Search ID</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channelList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No channels found.</TableCell>
                </TableRow>
              ) : (
                channelList.map((channel) => (
                  <TableRow key={channel.channelId}>
                    <TableCell className="font-medium">{channel.channelId}</TableCell>
                    <TableCell>{channel.phoneNumber}</TableCell>
                    <TableCell>{channel.searchId}</TableCell>
                    <TableCell>{channel.dateCreated && new Date(channel.dateCreated).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <Button asChild variant="outline" size="sm">
                            <NavLink to={`/admin/sms/solapi/dashboard/${profile}/kakao/channels/${channel.channelId}/templates`}>
                                Templates
                            </NavLink>
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
