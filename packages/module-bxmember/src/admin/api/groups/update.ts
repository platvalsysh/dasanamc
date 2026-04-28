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
    const name = formData.get("name") as string;
    const memo = formData.get("memo") as string;

    if (!id || !name) {
        return response({ success: false, error: "ID and Name are required" }, { status: 400 });
    }

    try {
        const updatedGroup = await prisma.bxmember_groups.update({
            where: { id },
            data: {
                name,
                extra_vars: memo ? { memo } : {},
            },
            include: { _count: { select: { bxmember_group_members: true } } }
        });
        return response({ success: true, group: updatedGroup });
    } catch (error) {
        console.error("Update group error:", error);
        return response({ success: false, error: "Failed to update group" }, { status: 500 });
    }
}
