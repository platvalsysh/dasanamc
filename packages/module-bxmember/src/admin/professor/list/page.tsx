import {
  Link,
  Form,
  useSearchParams,
  useLoaderData,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  data as response,
} from "react-router";
import {
  LucideSearch,
  LucideEdit,
  LucidePlus,
  LucideChevronLeft,
  LucideChevronRight,
} from "lucide-react";
import { prisma, type Prisma, type bxprofessor } from "@repo/database";
import { useAuthServerContext } from "@repo/auth/server";
import { getSmsTestConfig } from "@repo/module-sms/server";
import { useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from "@repo/ui-admin";
import { CreateProfessorDialog } from "./components/CreateProfessorDialog";
import { EditProfessorDialog } from "./components/EditProfessorDialog";
import { ExcelUploadDialog } from "./components/ExcelUploadDialog";
import { ExcelDownloadDialog } from "./components/ExcelDownloadDialog";
import { SelectedSmsModal } from "../../member/components/SelectedSmsModal";
import { SelectedEmailModal } from "../../member/components/SelectedEmailModal";
import { SelectedAlimtalkModal } from "../../member/components/SelectedAlimtalkModal";
import { ProfessorAllSmsModal } from "../components/ProfessorAllSmsModal";
import { ProfessorAllEmailModal } from "../components/ProfessorAllEmailModal";
import { ProfessorAllAlimtalkModal } from "../components/ProfessorAllAlimtalkModal";
import { z } from "zod";

function getSearchWhere(searchValues: {
  keyword?: string;
  field?: string;
}) {
    const where: Prisma.bxprofessorWhereInput = {};

    if (searchValues.keyword) {
      const searchTarget = searchValues.field;
      const searchKeyword = searchValues.keyword;

      switch (searchTarget) {
        case "name_kor":
          where.name_kor = { contains: searchKeyword, mode: "insensitive" };
          break;
        case "email":
            where.email = { contains: searchKeyword, mode: "insensitive" };
            break;
        case "cellphone_number":
            where.cellphone_number = { contains: searchKeyword, mode: "insensitive" };
            break;
        default:
          where.name_kor = { contains: searchKeyword, mode: "insensitive" };
          break;
      }
    }
    return where;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  // Check permission - adjusting to use specific professor permission if mandated, or generic list if not defined yet.
  // Plan said 'bxprofessor.list'. I will assume I'll add this.
    if (!auth.checkPermissions(["bxmember.professor.list"])) {
      throw new Response("Permission denied", { status: 403 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 20;
  const skip = (page - 1) * limit;
  const searchTarget = url.searchParams.get("search_target") || undefined;
  const searchKeyword = url.searchParams.get("search_keyword") || undefined;

  const where: Prisma.bxprofessorWhereInput = {};
  if (searchKeyword) {
      where['AND'] = getSearchWhere({ field: searchTarget, keyword: searchKeyword });
  }

  const [total, data] = await Promise.all([
    prisma.bxprofessor.count({ where }),
    prisma.bxprofessor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { seq: "desc" },
    }),
  ]);

  const smsTestConfig = getSmsTestConfig();

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    smsTestConfig,
  };
}

const ProfessorSchema = z.object({
    name_kor: z.string().optional(),
    email: z.string().optional(),
    cellphone_number: z.string().optional(),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    if (!auth.checkPermissions(["bxmember.professor.create"])) return response({ success: false, error: "Permission denied" }, { status: 403 });
    const last = await prisma.bxprofessor.findFirst({ orderBy: { seq: "desc" } });
    const seq = (last?.seq || 0n) + 1n;
    const data = ProfessorSchema.parse(Object.fromEntries(formData));
    await prisma.bxprofessor.create({ data: { seq, ...data } });
    return response({ success: true });
  }

  if (intent === "update") {
     if (!auth.checkPermissions(["bxmember.professor.edit"])) return response({ success: false, error: "Permission denied" }, { status: 403 });
    const seq = BigInt(formData.get("seq") as string);
    const data = ProfessorSchema.parse(Object.fromEntries(formData));
    await prisma.bxprofessor.update({ where: { seq }, data });
    return response({ success: true });
  }

  if (intent === "delete") {
     if (!auth.checkPermissions(["bxmember.professor.delete"])) return response({ success: false, error: "Permission denied" }, { status: 403 });
    const seq = BigInt(formData.get("seq") as string);
    await prisma.bxprofessor.delete({ where: { seq } });
    return response({ success: true });
  }

  return response({ success: false });
}

export default function ProfessorListPage() {
  const { data, pagination, smsTestConfig } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [excelUploadOpen, setExcelUploadOpen] = useState(false);
  const [excelDownloadOpen, setExcelDownloadOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<bxprofessor | null>(null);

  const [selectedSmsOpen, setSelectedSmsOpen] = useState(false);
  const [selectedEmailOpen, setSelectedEmailOpen] = useState(false);
  const [selectedAlimtalkOpen, setSelectedAlimtalkOpen] = useState(false);
  const [groupSmsOpen, setGroupSmsOpen] = useState(false);
  const [groupEmailOpen, setGroupEmailOpen] = useState(false);
  const [groupAlimtalkOpen, setGroupAlimtalkOpen] = useState(false);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<bigint[]>([]);
  // Store specifically targeted IDs when opening modal
  const [targetIds, setTargetIds] = useState<bigint[]>([]);

  // Toggle single row selection
  const handleSelect = (seq: bigint) => {
    setSelectedIds(prev => 
      prev.includes(seq) ? prev.filter(id => id !== seq) : [...prev, seq]
    );
  };

  // Toggle all visible rows
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(data.map(m => m.seq));
    } else {
      setSelectedIds([]);
    }
  };

  const handleOpenSelectedSms = (ids: bigint[]) => {
    setTargetIds(ids);
    setSelectedSmsOpen(true);
  };

  const handleOpenSelectedEmail = (ids: bigint[]) => {
    setTargetIds(ids);
    setSelectedEmailOpen(true);
  };

  const handleOpenSelectedAlimtalk = (ids: bigint[]) => {
    setTargetIds(ids);
    setSelectedAlimtalkOpen(true);
  };

  const handleEdit = (professor: bxprofessor) => {
    setSelectedProfessor(professor);
    setEditOpen(true);
  };

  return (
    <div className="p-2 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 items-start">
        <h1 className="text-2xl font-bold text-gray-900">학부교수님</h1>
        <div className="flex gap-2 flex-wrap w-full justify-end">
          <Button
            onClick={() => setCreateOpen(true)}
            variant="default"
            className="flex items-center gap-2"
          >
            <LucidePlus size={16} />
            <span>교수 추가</span>
          </Button>
          <Button
            onClick={() => setGroupAlimtalkOpen(true)}
            variant="outline"
            className="bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600 hover:text-white"
          >
            <span>전체 알림톡</span>
          </Button>
          <Button
            onClick={() => setGroupSmsOpen(true)}
            variant="outline"
            className="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:text-white"
          >
            <span>전체 문자</span>
          </Button>
          <Button
            onClick={() => setGroupEmailOpen(true)}
            variant="outline"
            className="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:text-white"
          >
            <span>그룹 메일</span>
          </Button>
          {selectedIds.length > 0 && (
            <>
              <Button
                onClick={() => handleOpenSelectedSms(selectedIds)}
                variant="default"
              >
                <span>선택 문자 ({selectedIds.length})</span>
              </Button>
              <Button
                onClick={() => handleOpenSelectedEmail(selectedIds)}
                variant="default"
              >
                <span>선택 메일 ({selectedIds.length})</span>
              </Button>
              <Button
                onClick={() => handleOpenSelectedAlimtalk(selectedIds)}
                variant="outline"
                className="bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600 hover:text-white"
              >
                <span>선택 알림톡 ({selectedIds.length})</span>
              </Button>
            </>
          )}
        </div>
      </div>

       {/* Search & Filter */}
       <div className="bg-white p-4 border border-gray-200">
        <Form method="get" className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <label className="text-sm font-medium text-gray-700">검색 대상</label>
            <Select name="search_target" defaultValue={searchParams.get("search_target") || "name_kor"}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="검색 대상" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_kor">이름(한글)</SelectItem>
                <SelectItem value="email">이메일</SelectItem>
                <SelectItem value="cellphone_number">휴대폰</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700">검색어</label>
            <div className="relative">
              <Input
                name="search_keyword"
                defaultValue={searchParams.get("search_keyword") || ""}
                placeholder="검색어를 입력하세요"
                className="pl-10"
              />
              <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button type="submit" variant="default" className="flex-1 md:flex-none">검색</Button>
            <Button variant="outline" asChild className="flex-1 md:flex-none">
              <Link to=".">초기화</Link>
            </Button>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const hasSearch = !!searchParams.get("search_keyword");
                if (hasSearch) {
                  setExcelDownloadOpen(true);
                } else {
                  window.open("/admin/api/bxmember/professor/excel-download", "_blank");
                }
              }}
              className="flex-1 md:flex-none bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white"
            >
              엑셀 다운로드
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => setExcelUploadOpen(true)}
              className="flex-1 md:flex-none"
            >
              엑셀 업로드
            </Button>
          </div>
        </Form>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 whitespace-nowrap">
            <thead className="text-xs text-gray-900 uppercase font-semibold bg-gray-100/80 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 w-10">
                  <Checkbox
                    onCheckedChange={handleSelectAll}
                    checked={data.length > 0 && selectedIds.length === data.length}
                  />
                </th>
                <th className="px-6 py-3">No</th>
                <th className="px-6 py-3">이름(한글)</th>
                <th className="px-6 py-3">이메일</th>
                <th className="px-6 py-3">휴대폰</th>
                <th className="px-6 py-3 text-center md:sticky md:right-48 z-20 bg-gray-50 border-l border-gray-200">알림톡</th>
                <th className="px-6 py-3 text-center md:sticky md:right-32 z-20 bg-gray-50 border-l border-gray-100">SMS</th>
                <th className="px-6 py-3 text-center md:sticky md:right-16 z-20 bg-gray-50">E-mail</th>
                <th className="px-6 py-3 text-right md:sticky md:right-0 z-20 bg-gray-50">관리</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-400">데이터가 없습니다.</td></tr>
              ) : (
                data.map((prof) => (
                  <tr key={prof.seq.toString()} className="bg-white border-b hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedIds.includes(prof.seq)}
                        onCheckedChange={() => handleSelect(prof.seq)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{prof.seq.toString()}</td>
                    <td className="px-6 py-4">{prof.name_kor}</td>
                    <td className="px-6 py-4">{prof.email}</td>
                    <td className="px-6 py-4">{prof.cellphone_number}</td>
                     <td className="px-6 py-4 text-center md:sticky md:right-48 z-10 bg-white group-hover:bg-blue-50/50 border-l border-gray-200">
                       <Button variant="link" size="sm" onClick={() => handleOpenSelectedAlimtalk([prof.seq])} className="text-yellow-600 px-0">알림톡</Button>
                    </td>
                     <td className="px-6 py-4 text-center md:sticky md:right-32 z-10 bg-white group-hover:bg-blue-50/50 border-l border-gray-100">
                       <Button variant="link" size="sm" onClick={() => handleOpenSelectedSms([prof.seq])} className="text-blue-600 px-0">SMS</Button>
                    </td>
                    <td className="px-6 py-4 text-center md:sticky md:right-16 z-10 bg-white group-hover:bg-blue-50/50">
                       <Button variant="link" size="sm" onClick={() => handleOpenSelectedEmail([prof.seq])} className="text-blue-600 px-0">E-mail</Button>
                    </td>
                    <td className="px-6 py-4 text-right md:sticky md:right-0 z-10 bg-white group-hover:bg-blue-50/50">
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => handleEdit(prof)}
                         className="text-blue-600"
                       >
                         <LucideEdit size={16} />
                       </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
         {/* Simple Pagination Control - Reusing same logic or simplified */}
         {/* Ignoring pagination UI duplication for brevity, assumig standard pagination or adding simplifed one */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
           <span className="text-sm text-gray-700">Total <span className="font-semibold">{pagination.total}</span> items</span>
            <div className="flex gap-2">
               <Link
                to={`?page=${Math.max(1, pagination.page - 1)}&search_target=${searchParams.get("search_target") || ""}&search_keyword=${searchParams.get("search_keyword") || ""}`}
                className={`p-1 rounded ${pagination.page <= 1 ? "text-gray-300 pointer-events-none" : "hover:bg-gray-100"}`}
               ><LucideChevronLeft /></Link>
               <span className="self-center">Page {pagination.page} of {pagination.totalPages}</span>
               <Link
                to={`?page=${Math.min(pagination.totalPages, pagination.page + 1)}&search_target=${searchParams.get("search_target") || ""}&search_keyword=${searchParams.get("search_keyword") || ""}`}
                className={`p-1 rounded ${pagination.page >= pagination.totalPages ? "text-gray-300 pointer-events-none" : "hover:bg-gray-100"}`}
               ><LucideChevronRight /></Link>
            </div>
         </div>
      </div>

      <CreateProfessorDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditProfessorDialog open={editOpen} onOpenChange={setEditOpen} professor={selectedProfessor} />
      <ExcelUploadDialog open={excelUploadOpen} onOpenChange={setExcelUploadOpen} />
      <ExcelDownloadDialog open={excelDownloadOpen} onOpenChange={setExcelDownloadOpen} searchParams={searchParams} />
      
      <SelectedSmsModal
        open={selectedSmsOpen}
        onOpenChange={(val) => {
            setSelectedSmsOpen(val);
            if(!val) setTargetIds([]);
        }}
        recipients={
            data.filter(m => targetIds.includes(m.seq)).map(m => ({
                name_kor: m.name_kor || undefined,
                cellphone_number: m.cellphone_number || undefined
            }))
        }
        smsTestConfig={smsTestConfig}
      />
      <SelectedEmailModal
        open={selectedEmailOpen}
        onOpenChange={(val) => {
            setSelectedEmailOpen(val);
            if(!val) setTargetIds([]);
        }}
        recipients={
             data.filter(m => targetIds.includes(m.seq)).map(m => ({
                name_kor: m.name_kor || undefined,
                email: m.email || undefined
            }))
        }
      />
      
      {/* New Group Modals for Professors */}
      <ProfessorAllSmsModal 
        open={groupSmsOpen}
        onOpenChange={setGroupSmsOpen}
        smsTestConfig={smsTestConfig}
      />
      <ProfessorAllEmailModal
        open={groupEmailOpen}
        onOpenChange={groupEmailOpen ? () => setGroupEmailOpen(false) : setGroupEmailOpen}
      />
      <SelectedAlimtalkModal 
        open={selectedAlimtalkOpen}
        onOpenChange={(val) => {
            setSelectedAlimtalkOpen(val);
            if(!val) setTargetIds([]);
        }}
        recipients={
            data.filter(m => targetIds.includes(m.seq)).map(m => ({
                name_kor: m.name_kor || undefined,
                cellphone_number: m.cellphone_number || undefined
            }))
        }
        smsTestConfig={smsTestConfig}
      />
      <ProfessorAllAlimtalkModal 
        open={groupAlimtalkOpen}
        onOpenChange={setGroupAlimtalkOpen}
        smsTestConfig={smsTestConfig}
      />
    </div>
  );
}
