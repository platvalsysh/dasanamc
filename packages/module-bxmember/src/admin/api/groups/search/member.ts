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
  const major = url.searchParams.get("major");
  const graduate_number = url.searchParams.get("graduate_number");
  const sex = url.searchParams.get("sex");

  const where: Prisma.bxmemberWhereInput = {
      AND: []
  };

  if (q) {
      (where.AND as any[]).push({ name_kor: { contains: q, mode: "insensitive" } });
  }
  if (major && major !== "all") {
      (where.AND as any[]).push({ major: { equals: major } });
  }
  if (graduate_number && graduate_number !== "all") {
       (where.AND as any[]).push({ graduate_number: { equals: graduate_number } });
  }
  if (sex && sex !== "all") {
       (where.AND as any[]).push({ sex: { equals: sex } });
  }

  const items = await prisma.bxmember.findMany({
        where,
        select: {
            seq: true,
            name_kor: true,
            cellphone_number: true,
            email: true,
            major: true,
            enter_year: true,
            graduate_number: true,
            sex: true,
        },
        orderBy: [
            { graduate_number: "desc" },
            { seq: "desc" }
        ]
      });

  const results = items.map(i => ({
      key: `member-${i.seq}`,
      id: i.seq.toString(),
      name: i.name_kor,
      cellphone_number: i.cellphone_number,
      email: i.email,
      major: i.major,
      enter_year: i.enter_year,
      graduate_number: i.graduate_number,
      sex: i.sex || "",
      // status: i.status // removed as not requested in optimization plan but useful context? Plan said opt payload.
  }));

  return response({ 
      results,
  });
}

export type GroupMemberSearchLoaderData = ReturnType<typeof useLoaderData<typeof loader>>;
