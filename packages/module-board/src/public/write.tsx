
import { prisma } from "@repo/database";
import { FileService } from "@repo/module-file/server";
import {
  redirect,
  useLoaderData,
  useActionData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data, // Added 'data' import
} from "react-router";
import { BoardExtraVars } from "../BoardExtraVars";
import { BoardService } from "../BoardService";
import { Write as SkinWrite } from "../components/skins/write";
import { PostExtraVars } from "../PostExtraVars";

// import { parseFormData, validationError } from "@rvf/react-router"; // Removed
import { BoardWriteSchema } from "../BoardSchemas";
import { useAuthServerContext } from "@repo/auth/server";
import { z } from "zod";

// Validate params
const paramsSchema = z.object({
  boardName: z.string(),
});

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const paramsResult = paramsSchema.safeParse(params);
  if (!paramsResult.success) {
    throw new Response("Bad Request", { status: 400 });
  }
  const { boardName } = paramsResult.data;

  const auth = useAuthServerContext(context);
  const moduleData = await BoardService.getModuleByMid(boardName);
  if (!moduleData) {
    throw new Response("게시판을 찾을 수 없습니다.", { status: 404 });
  }
  const permissions = await BoardService.getPermissions({ auth, extra_vars: moduleData.extra_vars });
  if (!permissions.access) throw new Response("접근 권한이 없습니다.", { status: 403 });
  if (!permissions.write) throw new Response("쓰기 권한이 없습니다.", { status: 403 });
  

  const user = auth.getUser();
  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }


  const categories = await BoardService.getCategories(moduleData.id);
  const templates = await BoardService.getTemplates(moduleData.id);
  const documentId = crypto.randomUUID();

  return {
      module: moduleData,
      categories,
      templates,
      documentId,
      isEdit: false,
      document: null,
      permissions,
  };
}





export async function action({ request, params, context }: ActionFunctionArgs) {
  const paramsResult = paramsSchema.safeParse(params);
  if (!paramsResult.success) {
    throw new Response("Bad Request", { status: 400 });
  }
  const { boardName } = paramsResult.data;
  const auth = useAuthServerContext(context);
  const moduleData = await BoardService.getModuleByMid(boardName);
  if (!moduleData) {
    throw new Response("게시판을 찾을 수 없습니다.", { status: 404 });
  }
  const permissions = await BoardService.getPermissions({ auth, extra_vars: moduleData.extra_vars });
  if (!permissions.access) throw new Response("접근 권한이 없습니다.", { status: 403 });
  if (!permissions.write) throw new Response("쓰기 권한이 없습니다.", { status: 403 });

  const user = auth.getUser();
  if (!user) throw redirect("/login");

  const formData = await request.formData();
  const values = Object.fromEntries(formData);
  
  const result = BoardWriteSchema.safeParse(values);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return data({ errors, values }, { status: 400 });
  }

  const { 
    title, content, thumbnail, id, category_id, 
    is_notice, is_secret, allow_comment, is_temp 
  } = result.data;

  // Detect files for this document
  const attachedFiles = await prisma.files.findMany({
    where: { target_id: id }
  });

  // Merge extra_vars
  const extraVars = new PostExtraVars({
    has_file: PostExtraVars.hasAttachment(attachedFiles),
    has_image: PostExtraVars.hasImage(attachedFiles, content),
    has_video: PostExtraVars.hasVideo(attachedFiles, content)
  });

  // Create document
  const document = await BoardService.createDocument({
    documentId: id,
    moduleId: moduleData.id,
    title,
    content,
    thumbnail: thumbnail || null,
    isNotice: is_notice,
    isSecret: is_secret,
    commentStatus: allow_comment ? "ALLOW" : "DENY",
    status: is_temp ? "TEMP" : "PUBLIC",
    extraVars: extraVars,
    fileCount: attachedFiles.length,
    categoryId: category_id || null,
    authorId: user.id,
  });

  if (attachedFiles.length > 0) {
    await FileService.publishFiles(document.id);
  }

  return redirect(`/board/${boardName}`);
}

// ... types
export type BoardSkinWriteLoaderData = ReturnType<typeof useLoaderData<typeof loader>>;
export type BoardSkinWriteActionData = ReturnType<typeof useActionData<typeof action>>;
export interface BoardSkinWriteProps {
  loaderData: BoardSkinWriteLoaderData;
  actionData: BoardSkinWriteActionData;
  skin?: string;
}

export default function BoardWritePage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const config = BoardExtraVars.fromJson(loaderData.module.extra_vars);
  return <SkinWrite loaderData={loaderData} actionData={actionData} skin={config.skin} />;
}
