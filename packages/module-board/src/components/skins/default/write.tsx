import { Link, Form, useNavigation } from "react-router";
import { ArrowLeft as LucideArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { Editor } from "@repo/module-editor/ui";
import { BoardExtraVars } from "../../../BoardExtraVars";
import type { Category } from "../types";
import type { BoardSkinWriteProps } from "../../../public/write";
import { BoardLayout } from "./layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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

export function DefaultWrite({ loaderData, actionData }: BoardSkinWriteProps) {
  const { module, categories, documentId, permissions } = loaderData;
  const navigation = useNavigation();
  
  // Explicitly for Write, no document
  const config = BoardExtraVars.fromJson(module.extra_vars);

  const defaultValues = actionData?.values || {
    title: "",
    content: "",
    thumbnail: "",
    category_id: "",
    is_notice: "false",
    is_secret: config.use_secret ? "true" : "false",
    allow_comment: config.use_comment ? "true" : "false",
    is_temp: "false",
  };

  const [content, setContent] = React.useState(defaultValues.content as string || "");
  const [thumbnail, setThumbnail] = React.useState<string>(defaultValues.thumbnail as string || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingTemplateContent, setPendingTemplateContent] = useState<string | null>(null);

  const isSubmitting = navigation.state === "submitting";
  const canWrite = permissions?.write;

  const handleContentChange = (newContent: string) => {
      setContent(newContent);
  };

  const handleTemplateClick = (templateContent: string) => {
    if (content.trim()) {
      setPendingTemplateContent(templateContent);
      setIsDialogOpen(true);
    } else {
      handleContentChange(templateContent);
    }
  };

  const editorRef = React.useRef<any>(null);

  const confirmTemplateApply = () => {
    if (pendingTemplateContent) {
      if (editorRef.current) {
        editorRef.current.commands.setContent(pendingTemplateContent);
      } else {
        // Fallback or initialization case
        handleContentChange(pendingTemplateContent);
      }
    }
    setIsDialogOpen(false);
    setPendingTemplateContent(null);
  };
  
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
                <Select
                  name="category_id"
                  defaultValue={defaultValues.category_id as string}
                >
                  <SelectTrigger className="w-48 h-12">
                    <SelectValue placeholder="카테고리 선택" />
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
                defaultValue={defaultValues.title as string}
                placeholder="제목을 입력하세요"
                className="flex-1 h-12 text-lg font-medium"
                required
            />
          </div>
          {errors?.title && <p className="text-red-500 text-sm">{errors.title[0]}</p>}

        </div>
        
        {/* Templates */}
        {loaderData.templates && loaderData.templates.length > 0 && (
            <div className="flex gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-500 self-center mr-2">템플릿 불러오기:</span>
                {loaderData.templates.map((template) => ( // Type definition needed for templates
                    <Button
                        key={template.id}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTemplateClick(template.content)}
                        className="bg-gray-100 hover:bg-gray-200"
                    >
                        {template.name}
                    </Button>
                ))}
            </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>템플릿 적용 확인</DialogTitle>
              <DialogDescription>
                작성 중인 내용이 있습니다. 템플릿으로 덮어쓰시겠습니까?
                <br />
                기존 내용은 삭제됩니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={confirmTemplateApply}>덮어쓰기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-6 text-sm text-gray-600 bg-gray-50 p-4 border border-gray-200">
          {config.use_secret && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_secret"
              name="is_secret"
              value="true"
              defaultChecked={defaultValues.is_secret === "true"}
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
                defaultChecked={defaultValues.is_notice === "true"}
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
                defaultChecked={defaultValues.allow_comment === "true"}
              />
              <Label htmlFor="allow_comment" className="cursor-pointer">댓글 허용</Label>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_temp"
              name="is_temp"
              value="true"
              defaultChecked={defaultValues.is_temp === "true"}
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
            editorRef={editorRef}
          />
          <input type="hidden" name="content" value={content} />
          <input type="hidden" name="thumbnail" value={thumbnail} />
          {errors?.content && <p className="text-red-500 text-sm mt-1">{errors.content[0]}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button asChild variant="outline" size="lg" className="px-8 h-12">
            <Link to={`/board/${module.mid}`}>취소</Link>
          </Button>
          <Button
            type="submit"
            size="lg"
            className="px-8 h-12 bg-snublue hover:bg-snublue/90 flex items-center gap-2"
            disabled={isSubmitting || !canWrite}
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
              <span>등록하기</span>
            )}
          </Button>
        </div>
      </Form>
    </BoardLayout>
  );
}
