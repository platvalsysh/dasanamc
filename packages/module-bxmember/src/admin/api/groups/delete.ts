import { prisma } from "@repo/database";
import { type ActionFunctionArgs, data as response } from "react-router";
import { useAuthServerContext } from "@repo/auth/server";

export async function action({ request, context }: ActionFunctionArgs) {
    const auth = useAuthServerContext(context);
    if (!auth.checkPermissions(["bxmember.group.delete"])) {
        return response({ success: false, error: "Permission denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) {
        return response({ success: false, error: "ID is required" }, { status: 400 });
    }

    try {
        await prisma.bxmember_groups.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
        return response({ success: true, id });
    } catch (error) {
        console.error("Delete group error:", error);
        return response({ success: false, error: "Failed to delete group" }, { status: 500 });
    }
}
