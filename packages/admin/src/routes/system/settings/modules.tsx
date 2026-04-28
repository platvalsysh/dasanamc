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


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const search = url.searchParams.get("q") || undefined;
  
  // Use "module" or "mid" as the first argument? 
  // ModulesService.getModules(moduleName, page, limit, searchKeyword)
  // The first arg is 'moduleName' which seems to be a filter for 'module' column. 
  // If we want all, we might need adjustments or pass undefined/empty string if allowed.
  // Checking ModulesService source: 'where: { module: moduleName }'. 
  // It seems strictly filters by module name?
  // User wants "module list screen". Ideally all modules.
  // If ModulesService requires a moduleName, we might be limited.
  // Converting 'moduleName' to optional in logic or passing a wildcard if supported? 
  // Wait, the ModulesService implementation shows:
  /*
    static async getModules(
      moduleName: string,
      page: number = 1,
      limit: number = 20,
      searchKeyword?: string,
    ) {
      const skip = (page - 1) * limit;
      const where: Prisma.modulesWhereInput = {
        module: moduleName,
      };
      ...
  */
  // It effectively filters by `module` column. 
  // If the user wants ALL modules, this service method might need an update or we misuse it.
  // However, for this task, I will try to pass a common module name or maybe upgrade the service?
  // The user request says "packages/core/src/.server/ModulesService.ts mid 컬럼과 라우터와 연결시켜 새창으로 링크 열수있도록."
  // It implies using existing service. But if existing service enforces `module` filter, I cannot get list of ALL different modules easily unless I know the name.
  // Let's assume for now I should list all, so I might need to Modify ModulesService to make moduleName optional.
  // I will Modify ModulesService first to allow getting all modules if moduleName is not provided.
  
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
