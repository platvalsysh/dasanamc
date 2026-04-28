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
  const cursor = url.searchParams.get("cursor");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const where: Prisma.bxmember_groupsWhereInput = {
      deleted_at: null
  };
  
  if (q) {
      where.name = { contains: q, mode: "insensitive" };
  }

  const groups = await prisma.bxmember_groups.findMany({
      where,
      take: limit + 1, // Fetch one extra to check for next page
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { created_at: "desc" },
      include: {
          _count: {
              select: { bxmember_group_members: true }
          }
      }
  });

  let nextCursor: string | undefined = undefined;
  if (groups.length > limit) {
      const nextItem = groups.pop();
      nextCursor = nextItem?.id;
  }

  return response({ 
      groups,
      nextCursor
  });
}


export type GroupListLoaderData = ReturnType<typeof useLoaderData<typeof loader>>;

