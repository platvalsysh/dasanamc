import { Outlet, NavLink, useParams } from "react-router";
import { Button } from "@repo/ui-admin/components/ui/button";
import { ArrowLeft, List } from "lucide-react";


export default function KakaoTemplatesLayout() {
    const { profile, channelId } = useParams();

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                    <NavLink to={`/admin/sms/solapi/dashboard/${profile}/kakao/channels`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Channels
                    </NavLink>
                </Button>
                <div className="h-6 w-px bg-border" />
                <Button variant="ghost" size="sm" asChild>
                    <NavLink to={`/admin/sms/solapi/dashboard/${profile}/kakao/channels/${channelId}/templates`} end>
                        <List className="mr-2 h-4 w-4" />
                        Template List
                    </NavLink>
                </Button>
            </div>
            <Outlet />
        </div>
    );
}
