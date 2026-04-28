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
  LucideMoreHorizontal,
} from "lucide-react";
import { prisma, type Prisma, type bxmember } from "@repo/database";
import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox
} from "@repo/ui-admin";
import { CreateMemberDialog } from "./components/CreateMemberDialog";
import { EditMemberDialog } from "./components/EditMemberDialog";
import { ExcelUploadDialog } from "./components/ExcelUploadDialog";
import { ExcelDownloadDialog } from "./components/ExcelDownloadDialog";
import { GroupSmsModal } from "../components/GroupSmsModal";
import { SelectedSmsModal } from "../components/SelectedSmsModal";
import { GroupEmailModal } from "../components/GroupEmailModal";
import { SelectedEmailModal } from "../components/SelectedEmailModal";
import { GroupAlimtalkModal } from "../components/GroupAlimtalkModal";
import { SelectedAlimtalkModal } from "../components/SelectedAlimtalkModal";
import { useAuthServerContext } from "@repo/auth/server";
import { getSmsTestConfig } from "@repo/module-sms/server";


import { z } from "zod";

export function getSearchWhere(searchValues: {
  keyword?: string;
  field?: string;
}) {
  const where: Prisma.bxmemberWhereInput = {};

  if (searchValues.keyword?.trim()) {
    const searchTarget = searchValues.field;
    const searchKeyword = searchValues.keyword.trim();

    switch (searchTarget) {
      case "name_kor":
        where.name_kor = { contains: searchKeyword, mode: "insensitive" };
        break;
      case "major":
        where.major = { contains: searchKeyword, mode: "insensitive" };
        break;
      case "graduate_number":
        where.graduate_number = {
          equals: searchKeyword,
        };
        break;
      case "job_class":
        where.job_class = { contains: searchKeyword, mode: "insensitive" };
        break;
      case "office_name":
        where.OR = [
          { office_name: { contains: searchKeyword, mode: "insensitive" } },
          { office_position: { contains: searchKeyword, mode: "insensitive" } },
        ];
        break;
      case "office_position":
        where.office_position = {
          contains: searchKeyword,
          mode: "insensitive",
        };
        break;
      case "phone_number":
        where.OR = [
          { phone_number: { contains: searchKeyword, mode: "insensitive" } },
          {
            office_phone_number: {
              contains: searchKeyword,
              mode: "insensitive",
            },
          },
        ];
        break;
      case "cellphone_number":
        where.cellphone_number = {
          contains: searchKeyword,
          mode: "insensitive",
        };
        break;
      default:
        where.name_kor = { contains: searchKeyword, mode: "insensitive" };
        break;
    }
  }
  return where;
}

async function getMembers(
  page: number = 1,
  limit: number = 20,
  searchTarget?: string,
  searchKeyword?: string
) {
  const skip = (page - 1) * limit;
  const where: Prisma.bxmemberWhereInput = getSearchWhere({
    field: searchTarget,
    keyword: searchKeyword,
  });

  const [total, data, majors, masterMajors, doctorMajors] = await Promise.all([
    prisma.bxmember.count({ where }),
    prisma.bxmember.findMany({
      where,
      skip,
      take: limit,
      orderBy: { seq: "desc" },
    }),
    prisma.bxmember.findMany({
      distinct: ['major'],
      select: { major: true },
      where: { major: { not: null } },
      orderBy: { major: 'asc' },
    }),
    prisma.bxmember.findMany({
      distinct: ['master_major'],
      select: { master_major: true },
      where: { master_major: { not: null } },
      orderBy: { master_major: 'asc' },
    }),
    prisma.bxmember.findMany({
      distinct: ['doctor_major'],
      select: { doctor_major: true },
      where: { doctor_major: { not: null } },
      orderBy: { doctor_major: 'asc' },
    }),
  ]);

  return {
    data,
    options: {
      majors: majors.map(m => m.major).filter(Boolean) as string[],
      masterMajors: masterMajors.map(m => m.master_major).filter(Boolean) as string[],
      doctorMajors: doctorMajors.map(m => m.doctor_major).filter(Boolean) as string[],
    },
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}


// ... existing imports

const MemberSchema = z.object({
  name_kor: z.string().optional(),
  name_ch: z.string().optional(),
  sex: z.string().optional(),
  major: z.string().optional(),
  enter_year: z.string().optional(),
  graduate_number: z.string().optional(),
  graduate_year: z.string().optional(),
  graduate_month: z.string().optional(),
  master_major: z.string().optional(),
  master_graduate_number: z.string().optional(),
  master_graduate_year: z.string().optional(),
  master_graduate_month: z.string().optional(),
  doctor_major: z.string().optional(),
  doctor_graduate_number: z.string().optional(),
  doctor_graduate_year: z.string().optional(),
  doctor_graduate_month: z.string().optional(),
  // course: z.string().optional(),
  // finish_flag: z.string().optional(),
  // finish_year: z.string().optional(),
  decease: z.string().optional(),
  job_class: z.string().optional(),
  office_zipcode: z.string().optional(),
  office_address: z.string().optional(),
  office_name: z.string().optional(),
  office_position: z.string().optional(),
  office_phone_number: z.string().optional(),
  office_fax_number: z.string().optional(),
  office_area: z.string().optional(),
  email: z.string().optional(),
  zipcode: z.string().optional(),
  address: z.string().optional(),
  phone_number: z.string().optional(),
  fax_number: z.string().optional(),
  cellphone_number: z.string().optional(),
  remark: z.string().optional(),
  search_agree: z.string().optional(),
  is_major: z.string().optional(),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    if (!auth.checkPermissions(["bxmember.member.create"])) {
      return response({ success: false, error: "Permission denied" }, { status: 403 });
    }
    const lastMember = await prisma.bxmember.findFirst({
      orderBy: { seq: "desc" },
    });
    const seq = (lastMember?.seq || 0) + 1;

    // Parse form data using Zod
    // Object.fromEntries(formData) works for simple text fields
    const data = MemberSchema.parse(Object.fromEntries(formData));

    await prisma.bxmember.create({
      data: {
        seq,
        ...data,
      },
    });

    return response({ success: true });
  }

  if (intent === "update") {
    if (!auth.checkPermissions(["bxmember.member.edit"])) {
      return response({ success: false, error: "Permission denied" }, { status: 403 });
    }
    const seq = parseInt(formData.get("seq") as string);
    const data = MemberSchema.parse(Object.fromEntries(formData));

    await prisma.bxmember.update({
      where: { seq },
      data,
    });

    return response({ success: true });
  }

  if (intent === "delete") {
    if (!auth.checkPermissions(["bxmember.member.delete"])) {
      return response({ success: false, error: "Permission denied" }, { status: 403 });
    }
    const seq = parseInt(formData.get("seq") as string);
    await prisma.bxmember.delete({
      where: { seq },
    });

    return response({ success: true });
  }

  return response({ success: false });
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  if (!auth.checkPermissions(["bxmember.member.list"])) {
    throw new Response("Permission denied", { status: 403 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const searchTarget = url.searchParams.get("search_target") || undefined;
  const searchKeyword = url.searchParams.get("search_keyword") || undefined;

  const [members] = await Promise.all([
    getMembers(page, 20, searchTarget, searchKeyword),

  ]);

  const smsTestConfig = getSmsTestConfig();

  return { members, smsTestConfig };
}

export default function MemberListPage() {
  const { members, smsTestConfig } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [excelUploadOpen, setExcelUploadOpen] = useState(false);

  const [excelDownloadOpen, setExcelDownloadOpen] = useState(false);
  const [groupSmsOpen, setGroupSmsOpen] = useState(false);
  const [selectedSmsOpen, setSelectedSmsOpen] = useState(false);
  const [groupEmailOpen, setGroupEmailOpen] = useState(false);
  const [selectedEmailOpen, setSelectedEmailOpen] = useState(false);
  const [groupAlimtalkOpen, setGroupAlimtalkOpen] = useState(false);
  const [selectedAlimtalkOpen, setSelectedAlimtalkOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<bxmember | null>(null);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // Store specifically targeted IDs when opening modal (either from selection or single click)
  const [targetIds, setTargetIds] = useState<number[]>([]);

  // Toggle single row selection
  const handleSelect = (seq: number) => {
    setSelectedIds(prev =>
      prev.includes(seq) ? prev.filter(id => id !== seq) : [...prev, seq]
    );
  };

  // Toggle all visible rows
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(members.data.map(m => m.seq));
    } else {
      setSelectedIds([]);
    }
  };

  const handleOpenSelectedSms = (ids: number[]) => {
    setTargetIds(ids);
    setSelectedSmsOpen(true);
  };

  const handleOpenSelectedEmail = (ids: number[]) => {
    setTargetIds(ids);
    setSelectedEmailOpen(true);
  };

  const handleOpenSelectedAlimtalk = (ids: number[]) => {
    setTargetIds(ids);
    setSelectedAlimtalkOpen(true);
  };


  const handleEdit = (member: bxmember) => {
    setSelectedMember(member);
    setEditOpen(true);
  };

  const { data, pagination, options } = members;

  return (
    <div className="p-2 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 items-start">
        <h1 className="text-2xl font-bold text-gray-900">동문관리</h1>
        <div className="flex gap-2 flex-wrap w-full justify-end">
          <Button
            onClick={() => setCreateOpen(true)}
            variant="default"
            className="flex items-center gap-2"
          >
            <LucidePlus size={16} />
            <span>회원 추가</span>
          </Button>
          <Button
            onClick={() => setGroupAlimtalkOpen(true)}
            variant="outline"
            className="bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600 hover:text-white"
          >
            <span>그룹 알림톡</span>
          </Button>
          <Button
            onClick={() => setGroupSmsOpen(true)}
            variant="outline"
            className="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:text-white"
          >
            <span>그룹 문자</span>
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
                onClick={() => handleOpenSelectedAlimtalk(selectedIds)}
                variant="outline"
                className="bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600 hover:text-white"
              >
                <span>선택 알림톡 ({selectedIds.length})</span>
              </Button>
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
            </>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Members</h3>
            <p className="text-2xl font-bold">{pagination.total}</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm">
             <h3 className="text-sm font-medium text-gray-500">Majors</h3>
             <p className="text-2xl font-bold">{options.majors.length}</p>
          </div>
      </div> */}

      {/* Search & Filter */}
      <div className="bg-white p-4 border border-gray-200">
        <Form method="get" className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <Label className="text-xs">검색 대상</Label>
            <Select name="search_target" defaultValue={searchParams.get("search_target") || "name_kor"}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="검색 대상" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_kor">이름(한글)</SelectItem>
                <SelectItem value="major">전공</SelectItem>
                <SelectItem value="graduate_number">기수</SelectItem>
                <SelectItem value="job_class">직업군</SelectItem>
                <SelectItem value="office_name">직장명</SelectItem>
                <SelectItem value="office_position">부서명/직책</SelectItem>
                <SelectItem value="phone_number">전화번호</SelectItem>
                <SelectItem value="cellphone_number">휴대폰</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <Label className="text-xs">검색어</Label>
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
                  window.open("/admin/api/bxmember/member/excel-download", "_blank");
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

      {/* Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 whitespace-nowrap">
            <thead className="text-xs text-gray-900 uppercase bg-gray-50 border-b border-gray-200 font-semibold">
              <tr>
                <th className="px-6 py-3 sticky left-0 z-20 bg-gray-100/80 border-r border-gray-200">
                  <Checkbox
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(members.data.map(m => m.seq));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    checked={data.length > 0 && selectedIds.length === data.length}
                  />
                </th>
                <th className="px-6 py-3">No</th>
                <th className="px-6 py-3">상태</th>
                <th className="px-6 py-3">이름(한글)</th>
                <th className="px-6 py-3">이름(한자)</th>
                <th className="px-6 py-3">성별</th>
                <th className="px-6 py-3">학사졸업 학과</th>
                <th className="px-6 py-3">학사입학 년도</th>
                <th className="px-6 py-3">학사졸업 기수</th>
                <th className="px-6 py-3">학사졸업 년도</th>
                <th className="px-6 py-3">학사졸업 월</th>
                <th className="px-6 py-3">석사 전공</th>
                <th className="px-6 py-3">석사 졸업 기수</th>
                <th className="px-6 py-3">석사 졸업 년도</th>
                <th className="px-6 py-3">석사 졸업 월</th>
                <th className="px-6 py-3">박사 전공</th>
                <th className="px-6 py-3">박사 졸업 기수</th>
                <th className="px-6 py-3">박사 졸업 년도</th>
                <th className="px-6 py-3">박사 졸업 월</th>
                <th className="px-6 py-3">작고</th>
                <th className="px-6 py-3">직업군</th>
                <th className="px-6 py-3">직장우편번호</th>
                <th className="px-6 py-3">직장 주소</th>
                <th className="px-6 py-3">현/최종 직장명</th>
                <th className="px-6 py-3">부서명/직책</th>
                <th className="px-6 py-3">직장 전화번호</th>
                <th className="px-6 py-3">회사팩스</th>
                <th className="px-6 py-3">이메일</th>
                <th className="px-6 py-3">자택우편번호</th>
                <th className="px-6 py-3">자택 주소</th>
                <th className="px-6 py-3">자택 전화번호</th>
                <th className="px-6 py-3">팩스</th>
                <th className="px-6 py-3">휴대전화</th>
                <th className="px-6 py-3">비고</th>
                <th className="px-6 py-3 md:sticky md:right-[140px] z-20 bg-gray-100/80 md:border-l md:border-gray-200">SMS</th>
                <th className="px-6 py-3 md:sticky md:right-[60px] z-20 bg-gray-100/80">E-mail</th>
                <th className="px-6 py-3 md:sticky md:right-0 z-20 bg-gray-100/80">수정</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={37}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                data.map((member: bxmember) => (
                  <tr
                    key={member.seq}
                    className="bg-white border-b hover:bg-blue-50/50 group transition-colors"
                  >
                    <td className="px-6 py-4 sticky left-0 z-10 bg-white group-hover:bg-blue-50/50 border-r border-gray-200">
                      <Checkbox
                        checked={selectedIds.includes(member.seq)}
                        onCheckedChange={() => handleSelect(member.seq)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {member.seq}
                    </td>
                    <td className="px-6 py-4">-</td>
                    <td className="px-6 py-4">{member.name_kor}</td>
                    <td className="px-6 py-4">{member.name_ch}</td>
                    <td className="px-6 py-4">{member.sex}</td>
                    <td className="px-6 py-4">{member.major}</td>
                    <td className="px-6 py-4">{member.enter_year}</td>
                    <td className="px-6 py-4">{member.graduate_number}</td>
                    <td className="px-6 py-4">{member.graduate_year}</td>
                    <td className="px-6 py-4">{member.graduate_month}</td>
                    <td className="px-6 py-4">{member.master_major}</td>
                    <td className="px-6 py-4">{member.master_graduate_number}</td>
                    <td className="px-6 py-4">{member.master_graduate_year}</td>
                    <td className="px-6 py-4">{member.master_graduate_month}</td>
                    <td className="px-6 py-4">{member.doctor_major}</td>
                    <td className="px-6 py-4">{member.doctor_graduate_number}</td>
                    <td className="px-6 py-4">{member.doctor_graduate_year}</td>
                    <td className="px-6 py-4">{member.doctor_graduate_month}</td>
                    <td className="px-6 py-4">{member.decease}</td>
                    <td className="px-6 py-4">{member.job_class}</td>
                    <td className="px-6 py-4">{member.office_zipcode}</td>
                    <td className="px-6 py-4">{member.office_address}</td>
                    <td className="px-6 py-4">{member.office_name}</td>
                    <td className="px-6 py-4">{member.office_position}</td>
                    <td className="px-6 py-4">{member.office_phone_number}</td>
                    <td className="px-6 py-4">{member.office_fax_number}</td>
                    <td className="px-6 py-4">{member.email}</td>
                    <td className="px-6 py-4">{member.zipcode}</td>
                    <td className="px-6 py-4">{member.address}</td>
                    <td className="px-6 py-4">{member.phone_number}</td>
                    <td className="px-6 py-4">{member.fax_number}</td>
                    <td className="px-6 py-4">{member.cellphone_number}</td>
                    <td className="px-6 py-4">{member.remark}</td>
                     <td className="px-6 py-4 text-center md:sticky md:right-[140px] z-10 bg-white group-hover:bg-blue-50/50 md:border-l md:border-gray-200">
                      <Button variant="link" size="sm" onClick={() => handleOpenSelectedSms([member.seq])} className="text-blue-600 px-0">SMS</Button>
                    </td>
                    <td className="px-6 py-4 text-center md:sticky md:right-[60px] z-10 bg-white group-hover:bg-blue-50/50">
                      <Button variant="link" size="sm" onClick={() => handleOpenSelectedEmail([member.seq])} className="text-blue-600 px-0">E-mail</Button>
                    </td>
                    <td className="px-6 py-4 text-right md:sticky md:right-0 z-10 bg-white group-hover:bg-blue-50/50">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(member)}
                          className="text-blue-600"
                          title="수정"
                        >
                          <LucideEdit size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-700">
            Total <span className="font-semibold">{pagination.total}</span>{" "}
            items
          </span>
          <div className="flex gap-1 items-center">
            {(() => {
              const totalPages = pagination.totalPages;
              const currentPage = pagination.page;
              const PAGE_BLOCK_SIZE = 10;

              // Sliding Window Logic
              // Try to center current page: (current - 5) ... current ... (current + 4)
              const half = Math.floor(PAGE_BLOCK_SIZE / 2);
              let startPage = Math.max(1, currentPage - half);
              let endPage = Math.min(totalPages, startPage + PAGE_BLOCK_SIZE - 1);

              // Adjust startPage if we are near the end and have space to show more previous pages
              if (endPage - startPage + 1 < PAGE_BLOCK_SIZE) {
                startPage = Math.max(1, endPage - PAGE_BLOCK_SIZE + 1);
              }

              const prevBlockPage = startPage - 1;
              const nextBlockPage = endPage + 1;

              return (
                <>
                  {/* Prev Block Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    disabled={prevBlockPage < 1}
                    asChild={prevBlockPage >= 1}
                  >
                    {prevBlockPage >= 1 ? (
                      <Link
                        to={`?page=${prevBlockPage}&search_target=${searchParams.get("search_target") || ""}&search_keyword=${searchParams.get("search_keyword") || ""}`}
                      >
                        <LucideChevronLeft size={16} />
                      </Link>
                    ) : (
                      <span>
                        <LucideChevronLeft size={16} />
                      </span>
                    )}
                  </Button>

                  {/* Page Numbers */}
                  {Array.from(
                    { length: endPage - startPage + 1 },
                    (_, i) => startPage + i
                  ).map((p) => {
                    const isCurrent = p === currentPage;
                    return (
                      <Button
                        key={p}
                        variant={isCurrent ? "default" : "outline"}
                        size="icon"
                        className={`w-8 h-8 ${isCurrent ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                        asChild
                      >
                        <Link
                          to={`?page=${p}&search_target=${searchParams.get("search_target") || ""}&search_keyword=${searchParams.get("search_keyword") || ""}`}
                        >
                          {p}
                        </Link>
                      </Button>
                    );
                  })}

                  {/* Next Block Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    disabled={nextBlockPage > totalPages}
                    asChild={nextBlockPage <= totalPages}
                  >
                    {nextBlockPage <= totalPages ? (
                      <Link
                        to={`?page=${nextBlockPage}&search_target=${searchParams.get("search_target") || ""}&search_keyword=${searchParams.get("search_keyword") || ""}`}
                      >
                        <LucideChevronRight size={16} />
                      </Link>
                    ) : (
                      <span>
                        <LucideChevronRight size={16} />
                      </span>
                    )}
                  </Button>

                  {/* Page Jump */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 ml-1"
                        title="Go to page"
                      >
                        <LucideMoreHorizontal size={16} />
                      </Button>
                    </PopoverTrigger>
                        <PopoverContent className="w-44 p-3">
                          <Form method="get" className="flex flex-col gap-2">
                            <input type="hidden" name="search_target" value={searchParams.get("search_target") || ""} />
                            <input type="hidden" name="search_keyword" value={searchParams.get("search_keyword") || ""} />
                            <Label className="text-xs font-semibold">페이지 이동</Label>
                            <div className="flex gap-2">
                                <Input
                                  name="page"
                                  placeholder="Page"
                                  className="h-8 w-20"
                                  type="number"
                                  min={1}
                                  max={totalPages}
                                />
                                <Button size="sm" type="submit" className="h-8 px-3">
                                  Go
                                </Button>
                            </div>
                          </Form>
                        </PopoverContent>
                  </Popover>
                </>
              );
            })()}
          </div>
        </div>
      </div>
      <CreateMemberDialog open={createOpen} onOpenChange={setCreateOpen} options={options} />
      <EditMemberDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        member={selectedMember}
        options={options}
      />
      <ExcelUploadDialog open={excelUploadOpen} onOpenChange={setExcelUploadOpen} />
      <ExcelDownloadDialog
        open={excelDownloadOpen}
        onOpenChange={setExcelDownloadOpen}
        searchParams={searchParams}
      />
      <GroupSmsModal
        open={groupSmsOpen}
        onOpenChange={setGroupSmsOpen}
        smsTestConfig={smsTestConfig}
      />
      <SelectedSmsModal
        open={selectedSmsOpen}
        onOpenChange={(val) => {
          setSelectedSmsOpen(val);
          if (!val) setTargetIds([]);
        }}
        recipients={
          data.filter(m => targetIds.includes(m.seq)).map(m => ({
            name_kor: m.name_kor || undefined,
            cellphone_number: m.cellphone_number || undefined
          }))
        }
        smsTestConfig={smsTestConfig}
      />
      <GroupEmailModal
        open={groupEmailOpen}
        onOpenChange={setGroupEmailOpen}
      />
      <SelectedEmailModal
        open={selectedEmailOpen}
        onOpenChange={(val) => {
          setSelectedEmailOpen(val);
          if (!val) setTargetIds([]);
        }}
        recipients={
          data.filter(m => targetIds.includes(m.seq)).map(m => ({
            name_kor: m.name_kor || undefined,
            email: m.email || undefined
          }))
        }
      />
      <GroupAlimtalkModal
        open={groupAlimtalkOpen}
        onOpenChange={setGroupAlimtalkOpen}
        smsTestConfig={smsTestConfig}
      />
      <SelectedAlimtalkModal
        open={selectedAlimtalkOpen}
        onOpenChange={(val) => {
          setSelectedAlimtalkOpen(val);
          if (!val) setTargetIds([]);
        }}
        recipients={
          data.filter(m => targetIds.includes(m.seq)).map(m => ({
            name_kor: m.name_kor || undefined,
            cellphone_number: m.cellphone_number || undefined
          }))
        }
        smsTestConfig={smsTestConfig}
      />
    </div>
  );
}
