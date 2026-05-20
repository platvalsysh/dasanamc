import React, { useState } from "react";
import { Link, useLoaderData, useNavigation, Form, redirect } from "react-router";
import { BoardAdminTabs } from "../components/BoardAdminTabs";
import { BoardService } from "../../BoardService";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useAuthServerContext } from "@repo/auth/server";
import { Editor } from "@repo/module-editor/ui";
import { Button, Input } from "@repo/ui-admin";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["board.admin.manage", "board.*"]);
  const { id, templateId } = params;
  
  // Checking if new or edit
  let template = null;
  if (templateId && templateId !== "new") {
    template = await BoardService.getTemplate(templateId);
    if (!template) throw new Response("Not Found", { status: 404 });
  }

  return { moduleId: id!, template };
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["board.admin.manage", "board.*"]);
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const content = formData.get("content") as string;
  const listOrder = parseInt(formData.get("list_order") as string || "0");
  const moduleId = params.id!;
  const templateId = params.templateId; // Note: route param name might be different depending on routes definition

  if (!name) {
    return { error: "템플릿 이름은 필수입니다." };
  }

  if (templateId && templateId !== "new") {
      // Update
      await BoardService.updateTemplate(templateId, { name, content, listOrder });
  } else {
      // Create
      await BoardService.createTemplate({ moduleId, name, content, listOrder });
  }

  return redirect(`/admin/board/${moduleId}/templates`);
}

export default function TemplateEditPage() {
  const { moduleId, template } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const [content, setContent] = useState(template?.content || "");

  // Update hidden input when editor changes
  // Already handled by BoardEditor? 
  // BoardEditor just calls onChange. We need to store state and put in hidden input.

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">게시판 수정</h1>
        <BoardAdminTabs moduleId={moduleId} activeTab="templates" />

        <Form method="post" className="bg-white p-6 border border-gray-200 space-y-6">
          <h2 className="text-lg font-medium">{template ? "템플릿 수정" : "템플릿 생성"}</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              템플릿 이름
            </label>
            <Input
              type="text"
              name="name"
              defaultValue={template?.name}
              required
              placeholder="예: 부고 알림"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
              순서
            </label>
            <Input
              type="number"
              name="list_order"
              defaultValue={template?.list_order || 0}
              className="w-32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              내용
            </label>
            <div className="border">
                 <Editor
                     content={content}
                     onChange={setContent}
                     module="board" 
                     moduleId={moduleId}
                     showFileUploader={true} // Templates might benefit from image upload
                     placeholder="템플릿 내용을 입력하세요..."
                 />
                 <input type="hidden" name="content" value={content} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              asChild
              variant="outline"
            >
              <Link to={`/admin/board/${moduleId}/templates`}>
                취소
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-bold"
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </div>

        </Form>
      </div>
    </div>
  );
}
