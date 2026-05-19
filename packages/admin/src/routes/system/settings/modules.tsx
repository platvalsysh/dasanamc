import { format } from "date-fns";
import { ModulesService } from "@repo/core/server";
import {
  Badge,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui-admin";
import { ExternalLink, Search } from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { Form, Link, useLoaderData, useSearchParams } from "react-router";


/**
 * 모듈 인스턴스 목록 (core.modules 테이블).
 *
 * 예: 게시판 모듈의 인스턴스 — `module="board"`, `mid="Notice"` / `mid="Freeboard"`.
 * 모듈 정의(코드)와 무관하게 운영자가 만든 _인스턴스_ 가 여기 들어옴.
 * 모듈 자체 관리는 `installed-modules` 페이지 참고.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const search = url.searchParams.get("q") || undefined;
  return ModulesService.getModules({ searchKeyword: search }, page, 10);
};

export default function DatabaseModules() {
  const { data, pagination } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">모듈 관리</h2>
          <p className="text-sm text-gray-500 mt-1">
            데이터베이스에 저장된 모듈 정보를 관리합니다.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Form method="get" className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              name="q"
              placeholder="Module ID (mid) 검색..."
              defaultValue={q}
              className="pl-8"
            />
          </div>
          <Button type="submit" variant="secondary">
            검색
          </Button>
        </Form>
      </div>

      <div className="bg-white rounded-md border text-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>모듈명 (Module)</TableHead>
              <TableHead>MID (Path)</TableHead>
              <TableHead>브라우저 타이틀</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead className="w-[100px]">이동</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((module) => (
                <TableRow key={module.id}>
                  <TableCell className="font-medium text-gray-900">
                    {module.module}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {module.mid}
                    </Badge>
                  </TableCell>
                  <TableCell>{module.browser_title || "-"}</TableCell>
                  <TableCell className="text-gray-500">
                    {module.created_at
                      ? format(new Date(module.created_at), "yyyy.MM.dd HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      title="새 창으로 열기"
                    >
                      <Link to={`/${module.mid}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
          (p) => (
            <Button
              key={p}
              variant={p === pagination.page ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link
                to={`?page=${p}${q ? `&q=${q}` : ""}`}
                className="w-8 h-8 p-0"
              >
                {p}
              </Link>
            </Button>
          ),
        )}
      </div>
    </div>
  );
}
