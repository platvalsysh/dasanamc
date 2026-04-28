import { type LoaderFunctionArgs, data as response, type useLoaderData } from "react-router";
import { prisma, type Prisma } from "@repo/database";
import { useAuthServerContext } from "@repo/auth/server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.group.list"])) {
      throw new Response("Permission denied", { status: 403 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 10000;
  const skip = 0;

  const where: Prisma.organization_membersWhereInput = {
      is_active: true
  };

  if (q) {
      where.name = { contains: q, mode: "insensitive" };
  }

  const [count, items] = await Promise.all([
      prisma.organization_members.count({ where }),
      prisma.organization_members.findMany({
        where,
        include: {
            organization_groups: {
                select: { name: true }
            },
            organization_positions: {
                select: { name: true }
            },
            bxmember: {
                select: { cellphone_number: true, email: true }
            }
        },
        skip,
        take: limit,
        orderBy: [
            { organization_groups: { order: "asc" } },
            { organization_positions: { order: "asc" } },
            { order: "asc" }
        ]
      })
  ]);

  const results = items.map(i => ({
      key: `exec-${i.id}`,
      id: i.id,
      seq: i.id, // For ref_data compatibility (requires a string)
      name: i.name,
      cellphone_number: i.bxmember?.cellphone_number || "",
      email: i.bxmember?.email || "",
      group_name: i.organization_groups?.name || "",
      position_name: i.organization_positions?.name || "",
      major: i.major || "",
      gisu: i.gisu || ""
  }));

  return response({ 
      results,
      page,
      hasMore: (skip + results.length) < count
  });
}

export type GroupExecutiveSearchLoaderData = ReturnType<typeof useLoaderData<typeof loader>>;
