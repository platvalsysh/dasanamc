import { Link, Form, useNavigation } from "react-router";
import { ArrowLeft as LucideArrowLeft } from "lucide-react";
import React from "react";
import { Editor } from "@repo/module-editor/ui";
import { BoardExtraVars } from "../../../BoardExtraVars";
import type { BoardSkinEditProps } from "../../../public/edit";
import type { Category } from "../types";
import { BoardLayout } from "./layout";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Label
} from "@repo/ui";

export function DefaultEdit({ loaderData, actionData }: BoardSkinEditProps) {
  const { module, categories, document, files, permissions, user } = loaderData;
  const navigation = useNavigation();
  const config = BoardExtraVars.fromJson(module.extra_vars);
  const documentId = document!.id; 

  const isSubmitting = navigation.state === "submitting";
  const canManage = permissions?.manage;
  const isAuthor = document!.author_id === user?.id; // user is guaranteed by loader
  const canEdit = canManage || isAuthor;
  // We should pass 'user' from loader to use it here or trust 'permissions.manage'.
  // However, authors can edit even if !manage.
  // Let's rely on server-side loader blocking unauthorized access.
  // But for "Delete", maybe we want to disable if not allowed? (Wait, loader blocks it anyway).
  // So buttons don't technically need disabling if the page wouldn't load.
  // User asked for "button checking".
  // Let's add 'user' to loaderData in public/edit.tsx first to be safe.
  
  // Prioritize actionData values if available, otherwise use loaderData
  const values = actionData?.values || {
    title: document!.title,
    content: document!.content,
    thumbnail: document!.thumbnail,
    category_id: document!.category_id,
    // Convert boolean/enum from document to string for consistency with actionData form values
    is_notice: document!.is_notice ? "true" : "false",
    is_secret: document!.is_secret ? "true" : "false",
    allow_comment: document!.comment_status === "ALLOW" ? "true" : "false",
    is_temp: document!.status === "TEMP" ? "true" : "false",
  };

  const [content, setContent] = React.useState(values.content as string || "");
  const [thumbnail, setThumbnail] = React.useState<string>(values.thumbnail as string || "");

  const handleContentChange = (newContent: string) => {
      setContent(newContent);
  };

  const editorRef = React.useRef<any>(null);
  
  const errors = actionData?.errors as Record<string, string[] | undefined> & { root?: string[] } | undefined;

  return (
    <BoardLayout module={module}>
      <Form method="post" className="space-y-6">
        <input type="hidden" name="id" value={documentId} />
        
        {/* Global Error */}
        {errors?.root && (
          <div className="bg-red-50 text-red-600 p-3 text-sm">
            {errors.root}
          </div>
        )}

        <div className="flex gap-2 flex-col">
          <div className="flex gap-2">
            {categories.length > 0 && (
              <Select name="category_id" defaultValue={values.category_id as string}>
                <SelectTrigger className="w-48 h-12">
                  <SelectValue placeholder="카테물리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">카테고리 없음</SelectItem>
                  {categories.map((cat: Category) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.depth > 0 ? "\u00A0".repeat(cat.depth * 2) + "└ " : ""}{cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Input
                type="text"
                name="title"
                defaultValue={values.title as string}
                placeholder="제목을 입력하세요"
                className="flex-1 h-12 text-lg font-medium"
                required
            />
          </div>
          {errors?.title && <p className="text-red-500 text-sm">{errors.title[0]}</p>}
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-600 bg-gray-50 p-4 border border-gray-200">
          {config.use_secret && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_secret"
                name="is_secret"
                value="true"
                defaultChecked={values.is_secret === "true"}
              />
              <Label htmlFor="is_secret" className="cursor-pointer">비밀글</Label>
            </div>
          )}

          {(permissions?.manage) && config.use_notice && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_notice"
                name="is_notice"
                value="true"
                defaultChecked={values.is_notice === "true"}
              />
              <Label htmlFor="is_notice" className="cursor-pointer">공지사항</Label>
            </div>
          )}

          {config.use_comment && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="allow_comment"
                name="allow_comment"
                value="true"
                defaultChecked={values.allow_comment === "true"}
              />
              <Label htmlFor="allow_comment" className="cursor-pointer">댓글 허용</Label>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_temp"
              name="is_temp"
              value="true"
              defaultChecked={values.is_temp === "true"}
            />
            <Label htmlFor="is_temp" className="cursor-pointer">임시저장</Label>
          </div>
        </div>

        <div>
          <Editor
              module="board"
              moduleId={module.id}
              targetId={documentId}
              content={content}
              onChange={handleContentChange}
              onSetMainThumbnail={setThumbnail}
              placeholder="내용을 입력하세요..."
            mainThumbnailId={thumbnail}
            showFileUploader={module.extra_vars.use_document_upload}
            initialFiles={files.map(f => ({
                id: f.id,
                url: f.thumbnail?.src,
                name: f.name,
                size: f.size,
            }))}
            editorRef={editorRef}
          />
          <input type="hidden" name="content" value={content} />
          <input type="hidden" name="thumbnail" value={thumbnail} />
          {errors?.content && <p className="text-red-500 text-sm mt-1">{errors.content[0]}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button asChild variant="outline" className="px-6 h-12">
            <Link to={`/board/${module.mid}/${documentId}`}>취소</Link>
          </Button>
          <Button
            type="submit"
            name="intent"
            value="update"
            disabled={isSubmitting || !canEdit}
            className="px-6 h-12 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>처리중...</span>
              </>
            ) : (
              <span>수정하기</span>
            )}
          </Button>
          <Button
            type="submit"
            name="intent"
            value="delete"
            variant="destructive"
            disabled={isSubmitting || !canEdit}
            className="px-6 h-12"
          >
            삭제
          </Button>
        </div>
      </Form>
    </BoardLayout>
  );
}

