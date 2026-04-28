import { prisma } from "@repo/database";
import { type ActionFunctionArgs, data as response } from "react-router";
import { useAuthServerContext } from "@repo/auth/server";

export async function action({ request, context }: ActionFunctionArgs) {
    const auth = useAuthServerContext(context);
    if (!auth.checkPermissions(["bxmember.group.edit"])) {
        return response({ success: false, error: "Permission denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const groupId = formData.get("group_id") as string;
    const type = formData.get("type") as string;
    const name = formData.get("snapshot_name") as string;
    const phone = formData.get("snapshot_phone") as string;
    const email = formData.get("snapshot_email") as string;
    const memo = formData.get("memo") as string;
    const refDataStr = formData.get("ref_data") as string;
    const targetId = formData.get("target_id") as string;

    if (!groupId || !type) {
        return response({ success: false, error: "Missing group_id or type" }, { status: 400 });
    }

    if ((type === "MEMBER" || type === "PROFESSOR" || type === "EXECUTIVE") && !targetId) {
         return response({ success: false, error: "Missing target_id" }, { status: 400 });
    }

    if (type !== "MEMBER" && type !== "PROFESSOR" && type !== "EXECUTIVE" && !name) {
         return response({ success: false, error: "Missing name" }, { status: 400 });
    }

    let memberId: number | null = null;
    let professorId: bigint | null = null;
    let executiveId: string | null = null;
    let refData = {};

    if (refDataStr) {
        try { refData = JSON.parse(refDataStr); } catch (e) {}
    }

    if (type === "MEMBER") memberId = parseInt(targetId);
    else if (type === "PROFESSOR") professorId = BigInt(targetId);
    else if (type === "EXECUTIVE") executiveId = targetId;

    try {
        await prisma.bxmember_group_members.create({
            data: {
                group_id: groupId,
                type,
                name,
                cellphone_number: phone,
                email,
                member_id: memberId,
                professor_id: professorId,
                executive_id: executiveId,
                ref_data: refData,
                extra_vars: memo ? { memo } : {},
            }
        });
        return response({ success: true });
    } catch (error) {
        console.error("Add member error:", error);
        return response({ success: false, error: "Failed to add member" }, { status: 500 });
    }
}
