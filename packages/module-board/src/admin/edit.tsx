import React from "react";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { Link } from "react-router";
import { ModulesService } from "@repo/core/server";
import { BoardAdminTabs } from "./components/BoardAdminTabs";
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

import { BoardExtraVars, type BoardPermissionConfig } from "../BoardExtraVars";
import { prisma, type Prisma } from "@repo/database";
import { useState } from "react";
import { BoardPermissionSelector } from "./components/BoardPermissionSelector";

export async function loader({ params }: LoaderFunctionArgs) {
  const moduleData = await ModulesService.getModule(params.id!);

  if (!moduleData) {
    throw new Response("Not Found", { status: 404 });
  }

  // Parse extra_vars using BoardExtraVars to ensure booleans
  const config = BoardExtraVars.fromJson(moduleData.extra_vars);

  // Fetch Admin Roles for "group" selection
  const roles = await prisma.admin_roles.findMany({
      orderBy: { created_at: "asc" }
  });

  return { module: moduleData, config, roles };
}

import { BoardAdminModuleSchema } from "../BoardSchemas";
import { data } from "react-router";

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const values = Object.fromEntries(formData);
  const result = BoardAdminModuleSchema.safeParse(values);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat()[0];
    return data({ error: firstError }, { status: 400 });
  }

  const { mid, browser_title, skin, description, use_comment, use_notice, use_secret, use_document_upload, permissions, list_display, read_display, page_count_pc, page_count_mobile, list_count } = result.data;

  try {
    const moduleData = await ModulesService.getModule(params.id!);
    if (!moduleData) throw new Error("Module not found");

    const currentExtraVars = BoardExtraVars.fromJson(moduleData.extra_vars);
    
    // Update only the fields managed by this form, preserving permissions
    currentExtraVars.skin = skin;
    // Ensure description is a string
    currentExtraVars.description = description || ""; 
    currentExtraVars.use_comment = use_comment;
    currentExtraVars.use_notice = use_notice;
    currentExtraVars.use_secret = use_secret;
    currentExtraVars.use_document_upload = use_document_upload;
    if (permissions) {
        currentExtraVars.permissions = permissions;
    }
    if (list_display) {
        currentExtraVars.list_display = list_display;
    }
    if (read_display) {
        currentExtraVars.read_display = read_display;
    }
    
    currentExtraVars.page_count_pc = page_count_pc;
    currentExtraVars.page_count_mobile = page_count_mobile;
    currentExtraVars.list_count = list_count;

    await ModulesService.updateModule(params.id!, {
      mid,
      browser_title: browser_title || undefined,
      extra_vars: currentExtraVars.toJSON() as unknown as Prisma.InputJsonValue,
    });

    return redirect("/admin/board");
  } catch (e) {
    return data({
      error: "게시판 수정 중 오류가 발생했습니다. (중복된 ID일 수 있습니다)",
    }, { status: 500 });
  }
}

export default function EditModulePage() {
  const { module, config, roles } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">게시판 수정</h1>
        </div>
        
        <BoardAdminTabs moduleId={module.id} activeTab="general" />

        <Form
          method="post"
          id="board-edit-form"
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
              defaultValue={module.mid}
              required
              className="w-full"
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
              defaultValue={module.browser_title || ""}
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
              defaultValue={config.skin || "general"}
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
              defaultValue={config.description || ""}
              rows={3}
              className="w-full"
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <Button asChild variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none shadow-none font-medium">
              <Link to="delete">삭제</Link>
            </Button>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="font-medium">
                <Link to="/admin/board">취소</Link>
              </Button>
              <Button
                type="submit"
                name="intent"
                value="update"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 font-bold"
              >
                {isSubmitting ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
