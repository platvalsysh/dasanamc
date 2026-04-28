import {
  useLoaderData,
  Form,
  type LoaderFunctionArgs,
} from "react-router";
import { prisma, type Prisma } from "@repo/database";
import { useAuthServerContext } from "@repo/auth/server";
import { LucideSearch } from "lucide-react";
import { checkMemberPublicAccess } from "../../config.server";

// Helper to construct search condition
function getSearchWhere(searchValues: {
  keyword?: string;
  field?: string;
}) {
  const where: Prisma.bxmemberWhereInput = {};

  if (searchValues.keyword) {
    const searchTarget = searchValues.field;
    const searchKeyword = searchValues.keyword;

    switch (searchTarget) {
      case "name_kor":
        where.name_kor = { contains: searchKeyword, mode: "insensitive" };
        break;
      case "graduatenumber":
        where.graduate_number = {
          contains: searchKeyword,
          mode: "insensitive",
        };
        break;
      case "officename":
        where.office_name = { contains: searchKeyword, mode: "insensitive" };
        break;
      case "enteryear":
        where.enter_year = { contains: searchKeyword, mode: "insensitive" };
        break;
      case "granduateyear":
        where.graduate_year = { contains: searchKeyword, mode: "insensitive" };
        break;
      default:
        // Default to name search
        where.name_kor = { contains: searchKeyword, mode: "insensitive" };
        break;
    }
  }
  return where;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  const isAllowed = await checkMemberPublicAccess(auth);

  if (!isAllowed) {
    // If user is not logged in, request 401 (unauthorized) which might trigger login redirect
    if (!auth.getUser()) {
      throw new Response("Unauthorized", { status: 401 });
    }
    // If logged in but no permission, 403 Forbidden
    throw new Response("Forbidden", { status: 403 });
  }
  const url = new URL(request.url);
  // const page = parseInt(url.searchParams.get("page") || "1");
  const searchTarget = url.searchParams.get("search_select") || undefined;
  const searchKeyword = url.searchParams.get("search_keyword") || undefined;

  // No pagination if searching, show all
  // const limit = 10000; 
  // const skip = (page - 1) * limit;

  // 2. Search Requirement: "검색 입력 안하면 리스트 나오지 않도록함"
  if (!searchKeyword) {
    return {
      members: {
        data: [],
      },
      searchParams: {
        search_select: searchTarget,
        search_keyword: searchKeyword
      },
      hasSearch: false
    };
  }

  const where: Prisma.bxmemberWhereInput = {};

  if (searchTarget && searchKeyword) {
    where['AND'] = getSearchWhere({ field: searchTarget, keyword: searchKeyword });
  }

  // Optimized query: No count, no skip/take, sort by name_kor asc
  const rawMembers = await prisma.bxmember.findMany({
    where,
    orderBy: { name_kor: "asc" },
    include: {
      users: {
        include: {
          profiles: true
        }
      }
    }
  });

  // Privacy Masking Logic
  const members = rawMembers.map((m) => {
    let searchAgree = 'N';
    if (m.search_agree !== 'N') {
      searchAgree = 'Y';
    }

    let o_email_address = 'N';
    let o_office_name = 'N';
    let o_office_position = 'N';

    const extraVars = m.users?.profiles?.extra_vars as Record<string, any> || {};

    if (extraVars.o_email_address === 'Y') o_email_address = 'Y';
    if (extraVars.o_office_name === 'Y') o_office_name = 'Y';
    if (extraVars.o_office_position === 'Y') o_office_position = 'Y';

    let office_name = m.office_name;
    let email = m.email;
    let office_position = m.office_position;

    if (searchAgree === 'N') {
      office_name = "";
      email = "";
      office_position = "";
    } else {
      if (o_office_name !== 'Y') office_name = "";
      if (o_office_position !== 'Y') office_position = "";
      if (o_email_address !== 'Y') email = "";
    }

    return {
      seq: m.seq,
      name_kor: m.name_kor,
      major: m.major,
      graduate_number: m.graduate_number,
      graduate_year: m.graduate_year,
      enter_year: m.enter_year,
      office_name,
      office_position,
      email,
    };
  });

  return {
    members: {
      data: members,
    },
    searchParams: {
      search_select: searchTarget,
      search_keyword: searchKeyword
    },
    hasSearch: true
  };
}

export default function Page() {
  const { members, searchParams: loaderSearchParams, hasSearch } = useLoaderData<typeof loader>();
  const { data } = members;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8" id="print-area">
      {/* Header & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">동문회원 검색</h1>
        <p className="text-sm text-gray-500 mb-6">
          이름, 졸업기수, 현/최종직장명, 입학년도, 졸업년도로 검색하실 수 있습니다.
        </p>

        <Form method="get" className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <select
              name="search_select"
              defaultValue={loaderSearchParams.search_select || "name_kor"}
              className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="name">이름</option>
              <option value="graduatenumber">졸업기수</option>
              <option value="officename">현/최종직장명</option>
              <option value="enteryear">입학년도</option>
              <option value="granduateyear">졸업년도</option>
            </select>
          </div>

          <div className="flex-1 w-full relative">
            <input
              type="text"
              name="search_keyword"
              defaultValue={loaderSearchParams.search_keyword || ""}
              className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
            <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          <button
            type="submit"
            className="h-10 px-6 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium w-full sm:w-auto"
          >
            검색
          </button>
        </Form>
      </div>

      {/* Results Controls */}
      {data.length > 0 && (
        <div className="flex justify-end mb-4 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            검색결과 인쇄
          </button>
        </div>
      )}

      {/* Results Table */}
      {hasSearch ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700 font-semibold print:bg-white print:border-black">
                <tr>
                  <th className="px-4 py-3 min-w-[80px]">이름</th>
                  <th className="px-4 py-3 min-w-[100px]">졸업학과</th>
                  <th className="px-4 py-3 min-w-[80px]">졸업기수</th>
                  <th className="px-4 py-3 min-w-[80px]">졸업년도</th>
                  <th className="px-4 py-3 min-w-[80px]">입학년도</th>
                  <th className="px-4 py-3 min-w-[150px]">현/최종 직장명</th>
                  <th className="px-4 py-3 min-w-[120px]">부서명&직책</th>
                  <th className="px-4 py-3 min-w-[150px]">e-mail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.length > 0 ? (
                  data.map((member) => (
                    <tr key={member.seq} className="hover:bg-gray-50 print:hover:bg-white">
                      <td className="px-4 py-3 font-medium text-gray-900">{member.name_kor}</td>
                      <td className="px-4 py-3 text-gray-600">{member.major}</td>
                      <td className="px-4 py-3 text-gray-600 center">{member.graduate_number}</td>
                      <td className="px-4 py-3 text-gray-600 center">{member.graduate_year}</td>
                      <td className="px-4 py-3 text-gray-600 center">{member.enter_year}</td>
                      <td className="px-4 py-3 text-gray-600">{member.office_name}</td>
                      <td className="px-4 py-3 text-gray-600">{member.office_position}</td>
                      <td className="px-4 py-3 text-gray-600 break-all">{member.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      검색결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
          검색어를 입력하여 조회할 수 있습니다.
        </div>
      )}

      {/* Pagination hidden because we show all */}

      {/* CSS for Print */}
      <style dangerouslySetInnerHTML={{
        __html: `
            @media print {
                @page { margin: 1cm; size: landscape; }
                body * {
                    visibility: hidden;
                }
                #print-area, #print-area * {
                    visibility: visible;
                }
                #print-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .print\\:hidden { display: none !important; }
                .print\\:shadow-none { shadow: none !important; }
                .print\\:bg-white { background-color: white !important; }
                .print\\:border-0 { border: none !important; }
                .print\\:border-black { border-color: black !important; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; font-size: 10pt; }
                th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
            }
        `}} />
    </div>
  );
}
