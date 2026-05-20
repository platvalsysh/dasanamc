import React from "react";
import { useLoaderData, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { ModulesService } from "@repo/core/server";
import { useAuthServerContext } from "@repo/auth/server";
import { BoardService } from "../BoardService";
import { CategoryManager } from "./components/CategoryManager";
import { BoardAdminTabs } from "./components/BoardAdminTabs";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["board.admin.manage", "board.*"]);
  const moduleData = await ModulesService.getModule(params.id!);
  if (!moduleData) {
    throw new Response("Not Found", { status: 404 });
  }

  const categories = await BoardService.getCategories(params.id!);

  return { module: moduleData, categories };
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["board.admin.manage", "board.*"]);
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "createCategory") {
      await BoardService.createCategory({
        moduleId: params.id!,
        name: formData.get("name") as string,
        parentId: formData.get("parentId") as string | null,
      });
      return null;
    } else if (intent === "updateCategory") {
      await BoardService.updateCategory(formData.get("categoryId") as string, {
        name: formData.get("name") as string,
      });
      return null;
    } else if (intent === "deleteCategory") {
      await BoardService.deleteCategory(formData.get("categoryId") as string);
      return null;
    } else if (intent === "reorderCategory") {
      await BoardService.reorderCategory(
        formData.get("categoryId") as string,
        formData.get("direction") as "up" | "down"
      );
      return null;
    }
  } catch (e) {
    return { error: "카테고리 처리 중 오류가 발생했습니다." };
  }

  return null;
}

export default function BoardCategoryPage() {
  const { module, categories } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">
          {module.browser_title || module.mid} <span className="text-gray-500 font-normal text-lg">카테고리 관리</span>
        </h1>
        
        <BoardAdminTabs moduleId={module.id} activeTab="category" />

        <CategoryManager moduleId={module.id} categories={categories} />
      </div>
    </div>
  );
}
