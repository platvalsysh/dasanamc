import { prisma } from "@repo/database";
import { useAuthServerContext } from "@repo/auth/server";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.member.list"])) {
    return Response.json({ success: false, error: "Permission denied" }, { status: 403 });
  }

  try {
    const professors = await prisma.bxprofessor.findMany({
      select: {
        seq: true,
        name_kor: true,
        cellphone_number: true,
        email: true,
      },
      orderBy: {
        name_kor: "asc", 
      }
    });

    // Handle BigInt serialization if necessary (though JSON.stringify handles basic numbers, BigInt fails)
    // bxprofessor seq is likely BigInt.
    const safeProfessors = professors.map(p => ({
        ...p,
        seq: p.seq.toString() // Convert BigInt to string for JSON safety
    }));

    return Response.json({
      success: true,
      data: {
        count: safeProfessors.length,
        professors: safeProfessors
      }
    });

  } catch (e: any) {
    console.error("Fetch All Professors Error", e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
