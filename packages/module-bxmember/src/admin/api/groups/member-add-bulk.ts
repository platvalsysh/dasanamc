import { prisma } from "@repo/database";
import { type ActionFunctionArgs, data as response } from "react-router";
import { useAuthServerContext } from "@repo/auth/server";

export async function action({ request, context }: ActionFunctionArgs) {
    const auth = useAuthServerContext(context);
    if (!auth.checkPermissions(["bxmember.group.edit"])) {
        return response({ success: false, error: "Permission denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const membersStr = formData.get("members") as string;

    if (!membersStr) {
        return response({ success: false, error: "Members data is required" }, { status: 400 });
    }

    let members: any[] = [];
    try {
        members = JSON.parse(membersStr);
        if (!Array.isArray(members)) throw new Error("Not an array");
    } catch (e) {
        return response({ success: false, error: "Invalid members format" }, { status: 400 });
    }

    if (members.length === 0) {
        return response({ success: true, count: 0 });
    }

    let successCount = 0;
    // Process sequentially or Promise.all.
    // Since prisma createMany doesn't support nested relations or some complex logic simply (and we have optional fields),
    // and we might want individual checks, simple loop is fine for moderate size.
    // However, createMany is better if we standardize the data.
    // But here we have variant logic (MEMBER vs PROFESSOR vs DIRECT).
    // Let's use a transaction or Promise.all
    
    // Validating and preparing data
    const prepareData = (m: any) => {
        const { group_id, type, target_id, snapshot_name, snapshot_phone, snapshot_email, memo, ref_data } = m;
        
        let memberId: number | null = null;
        let professorId: bigint | null = null;
        let executiveId: string | null = null;

        if (type === "MEMBER" && target_id) memberId = parseInt(target_id);
        else if (type === "PROFESSOR" && target_id) professorId = BigInt(target_id);
        else if (type === "EXECUTIVE" && target_id) executiveId = target_id;

        return {
            group_id,
            type,
            name: snapshot_name,
            cellphone_number: snapshot_phone,
            email: snapshot_email,
            member_id: memberId,
            professor_id: professorId,
            executive_id: executiveId,
            ref_data: ref_data || {},
            extra_vars: memo ? { memo } : {},
        };
    };

    try {
        await prisma.$transaction(
            members.map(m => 
                prisma.bxmember_group_members.create({
                    data: prepareData(m)
                })
            )
        );
        successCount = members.length;
        return response({ success: true, count: successCount });
    } catch (error) {
        console.error("Bulk add member error:", error);
        return response({ success: false, error: "Failed to add members" }, { status: 500 });
    }
}
