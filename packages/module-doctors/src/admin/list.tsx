import { Form, Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { useAuthServerContext } from "@repo/auth/server";
import { Button } from "@repo/ui-admin";
import { Plus } from "lucide-react";
import { DoctorsService } from "../.server/DoctorsService";
import { DoctorsOptions } from "../.server/DoctorsOptions";

export async function loader({ context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["doctors.list", "doctors.*"]);
  const doctors = await DoctorsService.listAll();
  const canEdit = auth.checkPermissions(["doctors.edit", "doctors.*"]);
  const canDelete = auth.checkPermissions(["doctors.delete", "doctors.*"]);
  const centerLabels = Object.fromEntries(
    DoctorsOptions.getCenters().map((c) => [c.id, c.label]),
  ) as Record<string, string>;
  return { doctors, canEdit, canDelete, centerLabels };
}

export default function DoctorsAdminList() {
  const { doctors, canEdit, canDelete, centerLabels } = useLoaderData<typeof loader>();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">의료진 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            의료진 소개 페이지와 센터 상세의 "함께하는 의료진" 에 노출되는 프로필입니다.
          </p>
        </div>
        {canEdit && (
          <Button asChild>
            <Link to="new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              새 의료진
            </Link>
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 w-16">순서</th>
              <th className="px-4 py-3 w-20">사진</th>
              <th className="px-4 py-3">이름 / 직책</th>
              <th className="px-4 py-3">담당 센터</th>
              <th className="px-4 py-3 w-24">구분</th>
              <th className="px-4 py-3 w-20">노출</th>
              <th className="px-4 py-3 w-40 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {doctors.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  등록된 의료진이 없습니다.
                </td>
              </tr>
            )}
            {doctors.map((d) => (
              <tr key={d.id} className={d.isActive ? "" : "bg-gray-50 text-gray-400"}>
                <td className="px-4 py-3 tabular-nums">{d.listOrder}</td>
                <td className="px-4 py-3">
                  {d.photoUrl ? (
                    <img
                      src={d.photoUrl}
                      alt=""
                      className="h-14 w-11 rounded object-cover object-top bg-gray-100"
                    />
                  ) : (
                    <div className="h-14 w-11 rounded bg-gray-100" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">{d.name}</div>
                  <div className="text-gray-500">{d.title}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {d.centers.map((id) => (
                      <span
                        key={id}
                        className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-800"
                      >
                        {centerLabels[id] ?? id}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">{d.isChief ? "대표원장" : "진료의"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      d.isActive
                        ? "rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700"
                        : "rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600"
                    }
                  >
                    {d.isActive ? "노출" : "숨김"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {canEdit && (
                      <Button asChild size="sm" variant="outline">
                        <Link to={`${d.id}/edit`}>수정</Link>
                      </Button>
                    )}
                    {canDelete && (
                      <Form
                        method="post"
                        action={`${d.id}/delete`}
                        onSubmit={(e) => {
                          if (!confirm(`'${d.name}' 프로필을 삭제할까요? 되돌릴 수 없습니다.`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Button type="submit" size="sm" variant="destructive">
                          삭제
                        </Button>
                      </Form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
