import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { z } from "zod";
import { BoardService } from "../BoardService";
import { List as SkinList } from "../components/skins/list";
import { useAuthServerContext } from "@repo/auth/server";

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
  if (!permissions.list) throw new Response("접근 권한이 없습니다.", { status: 403 });


  const url = new URL(request.url);
  const searchParamsSchema = z.object({
    page: z.coerce.number().default(1),
    search_target: z.string().default("title_content"),
    search_keyword: z.string().optional(),
    category_id: z.string().optional().nullable(),
  });
  const searchParamsResult = searchParamsSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!searchParamsResult.success) {
    throw new Response("Invalid Search Parameters", { status: 400 });
  }
  const { page, search_target, search_keyword, category_id } = searchParamsResult.data;


  const result = await BoardService.getDocuments({
    moduleId: moduleData.id,
    page,
    limit: moduleData.extra_vars?.list_count || 20,
    searchTarget: search_target,
    searchKeyword: search_keyword,
    categoryId: category_id || undefined,
  });


  if (!result) {
    throw new Response("게시판을 찾을 수 없습니다.", { status: 404 });
  }

  return {
    ...result,
    module: moduleData,
    currentCategoryId: category_id,
    permissions,
  };
}

// ... types
export type BoardSkinListLoaderData = ReturnType<typeof useLoaderData<typeof loader>>;
export type BoardSkinListActionData = undefined;
export interface BoardSkinListProps {
  loaderData: BoardSkinListLoaderData;
  actionData: BoardSkinListActionData;
  skin?: string;
}

export default function ModuleListPage() {
  const loaderData = useLoaderData<typeof loader>();
  const skin = loaderData.module.extra_vars.skin;
  
  return (
    <SkinList loaderData={loaderData} actionData={undefined} skin={skin} />
  );
}

