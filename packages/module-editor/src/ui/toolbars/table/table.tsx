import type { Editor } from "@tiptap/react";
import { Table as TableIcon } from "lucide-react";
import { Button } from "../../../../components/tiptap-ui-primitive/button/button";

interface TableToolbarProps {
  editor: Editor | null;
  isMarkdownMode?: boolean;
}

export function TableToolbar({ editor, isMarkdownMode }: TableToolbarProps) {
  if (!editor) return null;

  const onInsertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <>
      <Button
        data-style="ghost"
        onClick={onInsertTable}
        disabled={isMarkdownMode}
        tooltip="테이블 삽입"
      >
        <TableIcon className="w-4 h-4" />
      </Button>

      {editor.isActive("table") && (
        <>
          <Button
            data-style="ghost"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={isMarkdownMode}
            tooltip="행 추가"
            className="text-xs w-auto px-2"
          >
            +행
          </Button>
          <Button
            data-style="ghost"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={isMarkdownMode}
            tooltip="열 추가"
            className="text-xs w-auto px-2"
          >
            +열
          </Button>
          <Button
            data-style="ghost"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={isMarkdownMode}
            tooltip="행 삭제"
            className="text-xs w-auto px-2 hover:bg-red-50 hover:text-red-700"
          >
            -행
          </Button>
          <Button
            data-style="ghost"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={isMarkdownMode}
            tooltip="열 삭제"
            className="text-xs w-auto px-2 hover:bg-red-50 hover:text-red-700"
          >
            -열
          </Button>
          <Button
            data-style="ghost"
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={isMarkdownMode}
            tooltip="테이블 삭제"
            className="text-xs text-red-600 w-auto px-2 hover:bg-red-50 hover:text-red-700"
          >
            삭제
          </Button>
        </>
      )}
    </>
  );
}
