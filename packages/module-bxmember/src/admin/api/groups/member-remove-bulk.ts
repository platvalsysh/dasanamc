import { prisma } from "@repo/database";
import { type ActionFunctionArgs, data as response } from "react-router";
import { useAuthServerContext } from "@repo/auth/server";

export async function action({ request, context }: ActionFunctionArgs) {
    const auth = useAuthServerContext(context);
    if (!auth.checkPermissions(["bxmember.group.edit"])) {
        return response({ success: false, error: "Permission denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const idsStr = formData.get("ids") as string;
    
    if (!idsStr) {
        return response({ success: false, error: "IDs are required" }, { status: 400 });
    }

    let ids: string[] = [];
    try {
        ids = JSON.parse(idsStr);
        if (!Array.isArray(ids)) throw new Error("Not an array");
    } catch (e) {
        return response({ success: false, error: "Invalid IDs format" }, { status: 400 });
    }

    if (ids.length === 0) {
        return response({ success: true, count: 0 });
    }

    try {
        const result = await prisma.bxmember_group_members.deleteMany({
            where: {
                id: { in: ids }
            }
        });
        return response({ success: true, count: result.count });
    } catch (error) {
        console.error("Bulk remove member error:", error);
        return response({ success: false, error: "Failed to remove members" }, { status: 500 });
    }
}
