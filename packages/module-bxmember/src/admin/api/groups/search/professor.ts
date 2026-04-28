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
  const field = url.searchParams.get("field") || "all";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 10000; // Fetch 'all' effectively
  const skip = 0;

  const where: Prisma.bxprofessorWhereInput = {};

  if (q) {
    if (field === "name") {
        where.name_kor = { contains: q, mode: "insensitive" };
    } else {
        where.OR = [
            { name_kor: { contains: q, mode: "insensitive" } },
        ];
    }
  }

  const [count, items] = await Promise.all([
      prisma.bxprofessor.count({ where }),
      prisma.bxprofessor.findMany({
        where,
        select: {
            seq: true,
            name_kor: true,
            cellphone_number: true,
            email: true,
        },
        skip,
        take: limit,
        orderBy: { seq: "desc" }
      })
  ]);

  const results = items.map(i => ({
      key: `prof-${i.seq}`,
      id: i.seq.toString(),
      seq: i.seq.toString(), // Needed for ref_data
      name: i.name_kor,
      cellphone_number: i.cellphone_number,
      email: i.email,
  }));

  return response({ 
      results,
      page,
      hasMore: (skip + results.length) < count
  });
}

export type GroupProfessorSearchLoaderData = ReturnType<typeof useLoaderData<typeof loader>>;
