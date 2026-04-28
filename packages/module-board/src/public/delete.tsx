import { redirect, type ActionFunctionArgs } from "react-router";
import { BoardService } from "../BoardService";
import { useAuthServerContext } from "@repo/auth/server";
import { z } from "zod";
import { prisma } from "@repo/database";

// Validate params
const paramsSchema = z.object({
  boardName: z.string(),
  id: z.string(),
});

export async function action({ params, context }: ActionFunctionArgs) {
  const paramsResult = paramsSchema.safeParse(params);
  if (!paramsResult.success) {
    throw new Response("Bad Request", { status: 400 });
  }
  const { boardName, id } = paramsResult.data;

  const auth = useAuthServerContext(context);
  const moduleData = await BoardService.getModuleByMid(boardName);
  if (!moduleData) {
    throw new Response("게시판을 찾을 수 없습니다.", { status: 404 });
  }
  const permissions = await BoardService.getPermissions({ auth, extra_vars: moduleData.extra_vars });
  if (!permissions.access) {
    throw new Response("접근 권한이 없습니다.", { status: 403 });
  }
  if (!permissions.write) {
    throw new Response("수정 권한이 없습니다.", { status: 403 });
  }


  const user = auth.getUser();
  if (!user) return redirect("/login");

  // Fetch Document
  const document = await prisma.documents.findUnique({ where: { id } });
    if (!document) {
      throw new Response("Document Not Found", { status: 404 });
  }

  if (!permissions.manage && document.author_id !== user.id) {
      throw new Response("수정 권한이 없습니다.", { status: 403 });
  }

  try {
    await BoardService.deleteDocument(id);
    return redirect(`/board/${boardName}`);
  } catch (e: any) {
    throw new Response(e.message || "Failed to delete", { status: 500 });
  }
}
