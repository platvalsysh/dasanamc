
import { prisma } from "@repo/database";
import {
  redirect,
  useLoaderData,
  useActionData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data,
} from "react-router";
import { BoardExtraVars } from "../BoardExtraVars";
import { BoardService } from "../BoardService";
import { PostExtraVars } from "../PostExtraVars";

// import { parseFormData, validationError } from "@rvf/react-router"; // Removed
import { BoardWriteSchema } from "../BoardSchemas";
import { Edit as SkinEdit } from "../components/skins/edit";
import { FileService } from "@repo/module-file/server";
import { useAuthServerContext } from "@repo/auth/server";
import { z } from "zod";

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
  if (!permissions.access) {
    throw new Response("접근 권한이 없습니다.", { status: 403 });
  }
  if (!permissions.write) {
    throw new Response("수정 권한이 없습니다.", { status: 403 });
  }


  const user = auth.getUser();
  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }

  // Fetch Document
  const document = await BoardService.getDocument(id);
  if (!document) {
      throw new Response("Document Not Found", { status: 404 });
  }

  if (!permissions.manage && document.author_id !== user.id) {
      throw new Response("수정 권한이 없습니다.", { status: 403 });
  }

  // Fetch Categories
  const categories = await BoardService.getCategories(moduleData.id);

  // Fetch Files (for editing existing files)
  const files = await BoardService.getFiles(id);
  
  return {
    module: moduleData,
    document,
    categories,
    files,
    isEdit: true,
    documentId: id,
    permissions,
    user,
  };
}




export async function action({ request, params, context }: ActionFunctionArgs) {
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
  
  const document = await prisma.documents.findUnique({ where: { id } });
    if (!document) {
      throw new Response("Document Not Found", { status: 404 });
  }

  if (!permissions.manage && document.author_id !== user.id) {
      throw new Response("수정 권한이 없습니다.", { status: 403 });
  }

  const formData = await request.formData();
  
  // Handle intent for delete
  const intent = formData.get("intent");
  if (intent === "delete") {

    // Use BoardService (checks permissions & deletes files)
    await BoardService.deleteDocument(id);
    return redirect(`/board/${boardName}`);
  }

  const values = Object.fromEntries(formData);
  const result = BoardWriteSchema.safeParse(values);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return data({ errors, values }, { status: 400 });
  }

  const { title, content, thumbnail, category_id, is_notice, is_secret, allow_comment, is_temp } = result.data;

  const attachedFiles = await prisma.files.findMany({ where: { target_id: id } });

  const finalExtraVars = new PostExtraVars({
    has_file: PostExtraVars.hasAttachment(attachedFiles),
    has_image: PostExtraVars.hasImage(attachedFiles, content),
    has_video: PostExtraVars.hasVideo(attachedFiles, content)
  });

  await BoardService.updateDocument({
    documentId: id,
    title,
    content,
    thumbnail: thumbnail || null,
    isNotice: is_notice,
    isSecret: is_secret,
    commentStatus: allow_comment ? "ALLOW" : "DENY",
    status: is_temp ? "TEMP" : "PUBLIC",
    extraVars: finalExtraVars,
    fileCount: attachedFiles.length,
    categoryId: category_id || null,
  });


  if (attachedFiles.length > 0) {
    await FileService.publishFiles(document.id);
  }

  return redirect(`/board/${boardName}/${id}`);
}


// ... types
export type BoardSkinEditLoaderData = ReturnType<typeof useLoaderData<typeof loader>>;
export type BoardSkinEditActionData = ReturnType<typeof useActionData<typeof action>>;
export interface BoardSkinEditProps {
  loaderData: BoardSkinEditLoaderData;
  actionData: BoardSkinEditActionData;
  skin?: string;
}

export default function BoardEditPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const config = BoardExtraVars.fromJson(loaderData.module.extra_vars);
  return <SkinEdit loaderData={loaderData} actionData={actionData} skin={config.skin} />;
}
