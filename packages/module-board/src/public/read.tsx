// Replaces the action function and imports
import { useActionData, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { BoardExtraVars } from "../BoardExtraVars";
import { BoardService } from "../BoardService";
import { Read as SkinRead } from "../components/skins/read";

import { useAuthServerContext } from "@repo/auth/server";

import { z } from "zod";
import { getErrorMessage } from "@repo/core/utils";
import { 
  BoardCommentCreateSchema, 
  BoardCommentDeleteSchema, 
  BoardCommentVoteSchema 
} from "../BoardSchemas";

// Validate params
const paramsSchema = z.object({
  boardName: z.string(),
  id: z.string(),
});

export async function loader({ params, request, context }: LoaderFunctionArgs) {
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
  if (!permissions.access) throw new Response("접근 권한이 없습니다.", { status: 403 });
  if (!permissions.read) throw new Response("읽기 권한이 없습니다.", { status: 403 });


  // Module fetch removed (handled by middleware)
  const url = new URL(request.url);
  const searchParamsSchema = z.object({
    cpage: z.coerce.number().default(1),
  });
  const searchParamsResult = searchParamsSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!searchParamsResult.success) {
     throw new Response("Invalid Search Parameters", { status: 400 });
  }
  const { cpage } = searchParamsResult.data;
  const ipAddress = request.headers.get("x-app-client-ip") || "127.0.0.1";

  // 1. Fetch Document
  const document = await BoardService.getDocument(id);
  if (!document) {
      throw new Response("Document Not Found", { status: 404 });
  }

  const user = auth.getUser();
  // 2. Access Control (Secret Post)
  if (document.is_secret) {
    if (!user) {
      throw new Response("로그인을 해주세요.", { status: 403 });
    }
    if (!permissions.manage && document.author_id !== user.id) {
        throw new Response("작성자만 접근할 수 있습니다.", { status: 403 });
    }
  }

  // 3. Log View
  await BoardService.logView({
      documentId: id,
      userId: user?.id || null,
      ipAddress,
  });

  // 4. Fetch Comments
  const { comments, pagination: commentPagination } = await BoardService.getComments({
      documentId: id,
      page: cpage,
      limit: 100,
  });

  // 5. Fetch Files
  const files = await BoardService.getFiles(id);

  // 6. Check Votes
  let voteStatus = { hasLiked: false, hasBlamed: false, likedCommentIds: [] as string[] };
  if (user) {
      voteStatus = await BoardService.getVoteStatus({
          documentId: id,
          commentIds: comments.map(c => c.id),
          userId: user.id
      });
  }

  return {
      module: moduleData,
      document,
      comments,
      commentPagination,
      files,
      hasLiked: voteStatus.hasLiked,
      hasBlamed: voteStatus.hasBlamed,
      likedCommentIds: voteStatus.likedCommentIds,
      user,
      permissions, // from middleware
  };
}


// Action for handling comments

export async function action({ request, params, context }: LoaderFunctionArgs) {
  const paramsResult = paramsSchema.safeParse(params);
  if (!paramsResult.success) {
    return { error: "Bad Request" };
  }
  const { boardName, id } = paramsResult.data;

  const auth = useAuthServerContext(context);
  const moduleData = await BoardService.getModuleByMid(boardName);
  if (!moduleData) {
    return { error: "게시판을 찾을 수 없습니다." };
  }
  const permissions = await BoardService.getPermissions({ auth, extra_vars: moduleData.extra_vars });
  if (!permissions.access) return { error: "접근 권한이 없습니다." };
  if (!permissions.read) return { error: "읽기 권한이 없습니다." };


  const user = auth.getUser();
  const ipAddress = request.headers.get("x-app-client-ip") || "127.0.0.1";



  const formData = await request.formData();
  const intent = formData.get("intent");
  const values = Object.fromEntries(formData);

  if (intent === "create_comment") {
      if (!user) return { error: "로그인을 해주세요." };
      if (!permissions.comment) return { error: "댓글 작성 권한이 없습니다." };
      
      const result = BoardCommentCreateSchema.safeParse(values);
      if (!result.success) {
        return { error: "입력 값이 올바르지 않습니다." };
      }
      const { content, parent_id } = result.data;
      
      try {
        await BoardService.createComment({
            documentId: id,
            authorId: user.id,
            content,
            parentId: parent_id,
        });
        return { success: true };
      } catch (e) {
        return { error: "댓글 작성에 실패했습니다." };
      }
  }

  if (intent === "delete_comment") {
    if (!user) return { error: "로그인을 해주세요." };
    if (!permissions.comment) return { error: "댓글 작성 권한이 없습니다." };
    
    const result = BoardCommentDeleteSchema.safeParse(values);
    if (!result.success) {
        return { error: "잘못된 요청입니다." };
    }
    const { comment_id } = result.data;

    try {
        await BoardService.deleteComment({
            commentId: comment_id,
            documentId: id,
            userId: user.id,
            manage: permissions.manage,
        });
        return { success: true };
    } catch (e) {
        return { error: "댓글 삭제에 실패했습니다." };
    }
  }

  if (intent === "vote") {
     if (!user) return { error: "로그인을 해주세요." };

     try {
         await BoardService.toggleLike({
             documentId: id!,
             userId: user.id,
             ipAddress
         });
         return { success: true };
     } catch (e) {
         return { error: getErrorMessage(e) || "Failed to vote" };
     }
  }

  if (intent === "blame") {
     if (!user) return { error: "로그인을 해주세요." };

     try {
         await BoardService.toggleBlame({
             documentId: id!,
             userId: user.id,
             ipAddress
         });
         return { success: true };
     } catch (e) {
         return { error: getErrorMessage(e) || "Failed to report" };
     }
  }

  if (intent === "comment_vote") {
     if (!user) return { error: "로그인을 해주세요." };

      const result = BoardCommentVoteSchema.safeParse(values);
      if (!result.success) {
         return { error: "잘못된 요청입니다." };
      }
      const { comment_id } = result.data;

      try {
          await BoardService.toggleCommentLike({
              commentId: comment_id,
              userId: user.id,
              ipAddress
          });
          return { success: true };
      } catch (e) {
          return { error: getErrorMessage(e) || "Failed to vote" };
      }
  }

  return { error: "Invalid intent" };
}

export type BoardSkinReadLoaderData = ReturnType<typeof useLoaderData<typeof loader>>;
export type BoardSkinReadActionData = ReturnType<typeof useActionData<typeof action>>;
export interface BoardSkinReadProps {
  loaderData: BoardSkinReadLoaderData;
  actionData: BoardSkinReadActionData;
  skin?: string;
}

export default function BoardReadPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const config = BoardExtraVars.fromJson(loaderData.module.extra_vars);

  return (
    <SkinRead loaderData={loaderData} actionData={actionData} skin={config.skin} />
  );
}
