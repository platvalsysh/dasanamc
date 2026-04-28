import { prisma } from "@repo/database";
import { useAuthServerContext } from "@repo/auth/server";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  // Reusing existing permissions or creating new ones?
  // Let's use member.list as a base requirement for viewing options
  if (!auth.checkPermissions(["bxmember.member.list"])) {
    return Response.json({ success: false, error: "Permission denied" }, { status: 403 });
  }

  const groups = await prisma.bxmember.findMany({
    distinct: ['major', 'graduate_number'],
    select: { major: true, graduate_number: true },
    where: {
      major: { 
        notIn: [
            '공과대학전문부',
            '경성대학이공학부',
            '경성공업전문학교(후기)',
            '경성고등공업학교',
            '경성공업전문학교(전기)'
        ], 
        not: null 
      },
      graduate_number: { not: null },
    },
    orderBy: [
      { graduate_number: 'asc' },
      { major: 'asc' },
    ],
  });

  const combinedGroups = groups
    .filter(g => g.major && g.graduate_number)
    .sort((a, b) => {
      const numA = parseInt(a.graduate_number || "0", 10);
      const numB = parseInt(b.graduate_number || "0", 10);
      
      if (numA !== numB) return numA - numB;
      return (a.major || "").localeCompare(b.major || "");
    })
    .map(g => `${g.graduate_number}-${g.major}`);

  return Response.json({
    success: true,
    data: {
      groups: combinedGroups,
    },
  });
}
