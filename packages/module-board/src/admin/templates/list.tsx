import React from "react";
import { Link, useLoaderData, useFetcher } from "react-router";
import { BoardAdminTabs } from "../components/BoardAdminTabs";
import { BoardService } from "../../BoardService";
import { LucidePlus, LucideTrash, LucideEdit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Button } from "@repo/ui-admin";
import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

export async function loader({ params }: LoaderFunctionArgs) {
  const templates = await BoardService.getTemplates(params.id!);
  return { templates, moduleId: params.id! };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = formData.get("id") as string;

  if (intent === "delete" && id) {
    await BoardService.deleteTemplate(id);
  }
  return null;
}

export default function TemplateListPage() {
  const { templates, moduleId } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteTemplateId) {
      fetcher.submit(
        { intent: "delete", id: deleteTemplateId },
        { method: "post" }
      );
      setDeleteTemplateId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">게시판 수정</h1>
        <BoardAdminTabs moduleId={moduleId} activeTab="templates" />

        <div className="bg-white p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">템플릿 목록</h2>
            <Button asChild>
              <Link to="new" className="flex items-center gap-2">
                <LucidePlus size={16} />
                <span>템플릿 생성</span>
              </Link>
            </Button>
          </div>

          <div className="border overflow-hidden">
             <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">이름</th>
                  <th className="px-6 py-3">순서</th>
                  <th className="px-6 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                      등록된 템플릿이 없습니다.
                    </td>
                  </tr>
                ) : (
                  templates.map((template) => (
                    <tr key={template.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {template.name}
                      </td>
                      <td className="px-6 py-4">{template.list_order}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                             to={`${template.id}`}
                             className="p-1 text-blue-600 hover:bg-blue-50"
                             title="수정"
                          >
                            <LucideEdit size={16} />
                          </Link>
                          <button
                            type="button"
                            className="p-1 text-red-600 hover:bg-red-50"
                            title="삭제"
                            onClick={() => setDeleteTemplateId(template.id)}
                          >
                            <LucideTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>

        <Dialog open={!!deleteTemplateId} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>템플릿 삭제</DialogTitle>
              <DialogDescription>
                정말 이 템플릿을 삭제하시겠습니까? 삭제된 템플릿은 복구할 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteTemplateId(null)}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
