import React from "react";
import {
  Link,
  Form,
  useSearchParams,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router";
import {
  LucideSearch,
  LucideEdit,
  LucidePlus,
  LucideChevronLeft,
  LucideChevronRight,
} from "lucide-react";
import { ModulesService } from "@repo/core/server";
import { Button, Input } from "@repo/ui-admin";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const searchKeyword = url.searchParams.get("search_keyword") || undefined;

  const modules = await ModulesService.getModules({ moduleName: "board", searchKeyword }, page, 20);

  console.log("modules", modules);
  return { modules };
}

export default function ModuleListPage() {
  const { modules } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const { data, pagination } = modules;
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">게시판 관리</h1>
        <div className="flex gap-2">
          <Button asChild variant="default">
            <Link to="new" className="flex items-center gap-2">
              <LucidePlus size={16} />
              <span>게시판 생성</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 border border-gray-200">
        <Form method="get" className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700">검색어</label>
            <div className="relative">
              <Input
                name="search_keyword"
                defaultValue={searchParams.get("search_keyword") || ""}
                placeholder="게시판 ID 검색"
                className="pl-10"
              />
              <LucideSearch
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>
          <Button type="submit" variant="default">
            검색
          </Button>
        </Form>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Board ID (mid)</th>
                <th className="px-6 py-3">Browser Title</th>
                <th className="px-6 py-3">생성일</th>
                <th className="px-6 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                data.map((module) => (
                  <tr
                    key={module.id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <Link
                        to={`/board/${module.mid}`}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                        rel="noreferrer"
                      >
                        {module.mid}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {module.browser_title || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {module.created_at
                        ? new Date(module.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            to={`${module.id}`}
                            className="text-blue-600"
                            title="수정"
                          >
                            <LucideEdit size={16} />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="icon" asChild disabled={pagination.page === 1}>
            <Link
              to={`?page=${Math.max(1, pagination.page - 1)}${
                searchParams.get("search_keyword")
                  ? `&search_keyword=${searchParams.get("search_keyword")}`
                  : ""
              }`}
            >
              <LucideChevronLeft size={20} />
            </Link>
          </Button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? "default" : "outline"}
                size="icon"
                asChild
              >
                <Link
                  to={`?page=${pageNum}${
                    searchParams.get("search_keyword")
                      ? `&search_keyword=${searchParams.get("search_keyword")}`
                      : ""
                  }`}
                >
                  {pageNum}
                </Link>
              </Button>
            ),
          )}

          <Button variant="outline" size="icon" asChild disabled={pagination.page === pagination.totalPages}>
            <Link
              to={`?page=${Math.min(
                pagination.totalPages,
                pagination.page + 1,
              )}${
                searchParams.get("search_keyword")
                  ? `&search_keyword=${searchParams.get("search_keyword")}`
                  : ""
              }`}
            >
              <LucideChevronRight size={20} />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
