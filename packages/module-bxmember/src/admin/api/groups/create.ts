import { prisma } from "@repo/database";
import { type ActionFunctionArgs, data as response } from "react-router";
import { useAuthServerContext } from "@repo/auth/server";

export async function action({ request, context }: ActionFunctionArgs) {
    const auth = useAuthServerContext(context);
    if (!auth.checkPermissions(["bxmember.group.create"])) {
        return response({ success: false, error: "Permission denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const memo = formData.get("memo") as string;

    if (!name) {
        return response({ success: false, error: "Name is required" }, { status: 400 });
    }

    try {
        const newGroup = await prisma.bxmember_groups.create({
            data: {
                name,
                extra_vars: memo ? { memo } : {},
            },
            include: { _count: { select: { bxmember_group_members: true } } }
        });
        return response({ success: true, group: newGroup });
    } catch (error) {
        console.error("Create group error:", error);
        return response({ success: false, error: "Failed to create group" }, { status: 500 });
    }
}
