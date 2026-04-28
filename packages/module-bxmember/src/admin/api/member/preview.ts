import { type ActionFunctionArgs } from "react-router";
import { prisma, type Prisma } from "@repo/database";
import { useAuthServerContext } from "@repo/auth/server";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.member.list"])) {
    return Response.json({ success: false, error: "Permission denied" }, { status: 403 });
  }

  const formData = await request.formData();

  const groups = formData.get("groups") ? JSON.parse(formData.get("groups") as string) : [];

  const groupFilters = groups.map((g: string) => {
      // Assume format "GraduateNumber-Major"
      // Need to be careful about separator if data contains it.
      // For now trusting "-" separator as defined in options.
      // If Major has "-", split might be tricky.
      // Let's assume first part is GradNumber (usually numeric/short) and rest is Major.
      // Or find first index of "-".
      const separatorIndex = g.indexOf("-");
      if (separatorIndex === -1) return null;
      
      const graduate_number = g.substring(0, separatorIndex);
      const major = g.substring(separatorIndex + 1);
      return { graduate_number, major };
  }).filter(Boolean) as {graduate_number: string; major: string}[];


  if (groupFilters.length === 0) {
    return Response.json({ success: true,
      data: {
        count: 0,
        members: [],
      }
    });
  }

  const where: Prisma.bxmemberWhereInput = {
    OR: [...groupFilters],
  };


  const members = await prisma.bxmember.findMany({
    where,
    select: { seq: true, name_kor: true, cellphone_number: true, email: true, major: true, graduate_number: true },
  });

  return Response.json({
    success: true,
    data: {
      count: members.length,
      members,
    },
  });
}
