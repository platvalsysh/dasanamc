import React, { useState } from "react";
import {
  Form,
  redirect,
  useActionData,
  useNavigation,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { ModulesService } from "@repo/core/server";
import { useAuthServerContext } from "@repo/auth/server";
import { BoardExtraVars, type BoardPermissionConfig } from "../BoardExtraVars";
import { prisma } from "@repo/database";
import { BoardPermissionSelector } from "./components/BoardPermissionSelector";
import { BoardDisplayOptionsSelector } from "./components/BoardDisplayOptionsSelector";
import { 
  Button, 
  Input, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Textarea,
  Checkbox
} from "@repo/ui-admin";

const LIST_DISPLAY_OPTIONS = [
  { value: "id", label: "번호" },
  { value: "title", label: "제목" },
  { value: "user", label: "작성자" },
  { value: "created_at", label: "작성일" },
  { value: "view_count", label: "조회수" },
  { value: "like_count", label: "추천수" },
];

const READ_DISPLAY_OPTIONS = [
  { value: "author", label: "작성자" },
  { value: "created_at", label: "작성일" },
  { value: "view_count", label: "조회수" },
  { value: "like_count", label: "추천수" },
  { value: "blame", label: "신고" },
  { value: "file_list", label: "첨부파일 목록" },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["board.admin.manage", "board.*"]);
  const roles = await prisma.admin_roles.findMany({
      orderBy: { created_at: "asc" }
  });
  return { roles };
}

import { BoardAdminModuleSchema } from "../BoardSchemas";
import { data } from "react-router";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = useAuthServerContext(context);
  auth.requirePermissions(["board.admin.manage", "board.*"]);
  const formData = await request.formData();
  const values = Object.fromEntries(formData);
  const result = BoardAdminModuleSchema.safeParse(values);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    // Just return the first error message for simplicity or mapping errors
    // Simple error handling for now as per previous pattern
    const firstError = Object.values(errors).flat()[0];
    return data({ error: firstError }, { status: 400 });
  }

  const { mid, browser_title, skin, description, use_comment, use_notice, use_secret, use_document_upload, permissions, list_display, read_display, page_count_pc, page_count_mobile, list_count } = result.data;

  try {
    await ModulesService.createModule({
      module: "board",
      mid,
      browser_title: browser_title || undefined,
      extra_vars: {
        skin,
        description: description || "",
        use_comment,
        use_notice,
        use_secret,
        use_document_upload,
        permissions,
        list_display,
        read_display,
        page_count_pc,
        page_count_mobile,
        list_count,
      },
    });
    return redirect("/admin/board");
  } catch (e) {
    return data({
      error: "게시판 생성 중 오류가 발생했습니다. (중복된 ID일 수 있습니다)",
    }, { status: 500 });
  }
}

export default function NewModulePage() {
  const { roles } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  // Use BoardExtraVars defaults
  const config = new BoardExtraVars();
  const [permissions, setPermissions] = useState(config.permissions);
  const [listDisplay, setListDisplay] = useState<string[]>(config.list_display);
  const [readDisplay, setReadDisplay] = useState<string[]>(config.read_display);

  const handlePermissionChange = (key: keyof typeof permissions, newValue: BoardPermissionConfig) => {
    setPermissions(prev => ({
        ...prev,
        [key]: newValue
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">게시판 생성</h1>
      <Form
        method="post"
        className="space-y-6 bg-white p-6 border border-gray-200"
      >
        <input type="hidden" name="permissions" value={JSON.stringify(permissions)} />
        <input type="hidden" name="list_display" value={JSON.stringify(listDisplay)} />
        <input type="hidden" name="read_display" value={JSON.stringify(readDisplay)} />
        {actionData?.error && (
          <div className="bg-red-50 text-red-600 p-3 text-sm border-l-4 border-red-500">
            {actionData.error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            게시판 ID (mid)
          </label>
          <Input
            type="text"
            name="mid"
            required
            className="w-full"
            placeholder="example: notice"
          />
          <p className="text-xs text-gray-500 mt-1">
            영문 소문자와 숫자만 사용 가능합니다. URL의 일부로 사용됩니다.
          </p>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             브라우저 타이틀
           </label>
           <Input
             type="text"
             name="browser_title"
             className="w-full"
             placeholder="브라우저 탭에 표시될 제목"
           />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            스킨
          </label>
          <Select
            name="skin"
            defaultValue={config.skin}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">일반형 (General)</SelectItem>
              <SelectItem value="photo">갤러리형 (Photo)</SelectItem>
              <SelectItem value="faq">FAQ형 (FAQ)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              name="use_comment"
              defaultChecked={config.use_comment}
            />
            <span className="text-sm font-medium text-gray-700">댓글 사용</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              name="use_notice"
              defaultChecked={config.use_notice}
            />
            <span className="text-sm font-medium text-gray-700">공지사항 기능</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              name="use_secret"
              defaultChecked={config.use_secret}
            />
            <span className="text-sm font-medium text-gray-700">비밀글 기능</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              name="use_document_upload"
              defaultChecked={config.use_document_upload}
            />
            <span className="text-sm font-medium text-gray-700">파일첨부 기능</span>
          </label>
        </div>

        <div>
           <h3 className="text-lg font-medium text-gray-900 mb-4">화면 설정</h3>
           <div className="space-y-6">
               <div className="border border-gray-200 p-4 bg-gray-50">
                    <BoardDisplayOptionsSelector 
                        label="목록 화면에 표시할 항목" 
                        options={LIST_DISPLAY_OPTIONS} 
                        selected={listDisplay} 
                        onChange={setListDisplay} 
                    />
               </div>
               <div className="border border-gray-200 p-4 bg-gray-50">
                    <BoardDisplayOptionsSelector 
                        label="읽기 화면에 표시할 항목" 
                        options={READ_DISPLAY_OPTIONS} 
                        selected={readDisplay} 
                        onChange={setReadDisplay} 
                    />
               </div>
           </div>
        </div>

        <div>
           <h3 className="text-lg font-medium text-gray-900 mb-4">페이지 설정</h3>
           <div className="flex gap-4">
              <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                    페이지네이션 표시 개수 (PC)
                 </label>
                 <Input
                   type="number"
                   name="page_count_pc"
                   defaultValue={config.page_count_pc}
                   className="w-full"
                 />
              </div>
              <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                    페이지네이션 표시 개수 (Mobile)
                 </label>
                 <Input
                   type="number"
                   name="page_count_mobile"
                   defaultValue={config.page_count_mobile}
                   className="w-full"
                 />
              </div>
           </div>
           <div className="mt-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">
                목록 수 (List Count)
             </label>
             <Input
               type="number"
               name="list_count"
               defaultValue={config.list_count}
               className="w-full"
             />
             <p className="text-xs text-gray-500 mt-1">
               한 페이지에 표시할 게시물 수를 입력하세요.
             </p>
           </div>
        </div>

        <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">권한 설정</h3>
            <div className="space-y-6">
                <BoardPermissionSelector 
                    label="접근 권한 (Access)"
                    value={permissions.access}
                    onChange={(v) => handlePermissionChange("access", v)}
                    roles={roles}
                />
                <BoardPermissionSelector 
                    label="목록 조회 (List)"
                    value={permissions.list}
                    onChange={(v) => handlePermissionChange("list", v)}
                    roles={roles}
                />
                <BoardPermissionSelector 
                    label="글 열람 (Read)"
                    value={permissions.read}
                    onChange={(v) => handlePermissionChange("read", v)}
                    roles={roles}
                />
                <BoardPermissionSelector 
                    label="글 작성 (Write)"
                    value={permissions.write}
                    onChange={(v) => handlePermissionChange("write", v)}
                    roles={roles}
                />
                <BoardPermissionSelector 
                    label="댓글 작성 (Comment)"
                    value={permissions.comment}
                    onChange={(v) => handlePermissionChange("comment", v)}
                    roles={roles}
                />
                <BoardPermissionSelector 
                    label="관리 권한 (Manage)"
                    value={permissions.manage}
                    onChange={(v) => handlePermissionChange("manage", v)}
                    roles={roles}
                />
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설명
          </label>
          <Textarea
            name="description"
            rows={3}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-2 text-right">
          <Button
            type="button"
            variant="outline"
            onClick={() => history.back()}
            className="font-medium"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 font-bold"
          >
            {isSubmitting ? "생성 중..." : "생성"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
