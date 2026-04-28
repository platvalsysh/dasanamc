import { prisma } from "@repo/database";
import { type ActionFunctionArgs, data as response } from "react-router";
import { useAuthServerContext } from "@repo/auth/server";

export async function action({ request, context }: ActionFunctionArgs) {
    const auth = useAuthServerContext(context);
    if (!auth.checkPermissions(["bxmember.group.edit"])) {
        return response({ success: false, error: "Permission denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) {
        return response({ success: false, error: "ID is required" }, { status: 400 });
    }

    try {
        await prisma.bxmember_group_members.delete({ where: { id } });
        return response({ success: true, id });
    } catch (error) {
        console.error("Remove member error:", error);
        return response({ success: false, error: "Failed to remove member" }, { status: 500 });
    }
}
