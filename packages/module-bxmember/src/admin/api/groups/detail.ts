import { type LoaderFunctionArgs, data as response, type useLoaderData } from "react-router";
import { prisma } from "@repo/database";
import { useAuthServerContext } from "@repo/auth/server";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const auth = useAuthServerContext(context);
    if (!auth.checkPermissions(["bxmember.group.list"])) {
        throw new Response("Permission denied", { status: 403 });
    }

    const url = new URL(request.url);
    const groupId = url.searchParams.get("id");

    if (!groupId) {
        throw new Response("Missing group ID", { status: 400 });
    }

    const group = await prisma.bxmember_groups.findUnique({
        where: { id: groupId },
        include: {
            _count: {
                select: { bxmember_group_members: true }
            }
        }
    });

    if (!group) {
        throw new Response("Group not found", { status: 404 });
    }

    // Check if group is deleted? The list endpoint filters out deleted_at: null.
    // If we want to show details for deleted groups (maybe not reachable from UI), we can keep it.
    // But usually we should respect the same visibility rules.
    if (group.deleted_at) {
         throw new Response("Group not found", { status: 404 });
    }

    return response({ group });
}

export type GroupDetailLoaderData = ReturnType<typeof useLoaderData<typeof loader>>;
