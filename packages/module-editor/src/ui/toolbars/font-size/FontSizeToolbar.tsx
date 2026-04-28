import type { Editor } from "@tiptap/react";
import { useCallback, useState, useEffect } from "react";
import { ChevronDownIcon } from "../../../../components/tiptap-icons/chevron-down-icon";
import {
  Button,
  ButtonGroup,
} from "../../../../components/tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/tiptap-ui-primitive/dropdown-menu";
import { Card, CardBody } from "../../../../components/tiptap-ui-primitive/card";

export interface FontSizeToolbarProps {
  editor: Editor | null;
}

const fontSizes = [
  "8px",
  "9px",
  "10px",
  "11px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "30px",
  "36px",
  "48px",
  "60px",
  "72px",
  "96px",
];

export function FontSizeToolbar({ editor }: FontSizeToolbarProps) {
  const [currentFontSize, setCurrentFontSize] = useState("16px");

  const updateFontSize = useCallback(() => {
    if (editor) {
      const size = (editor.getAttributes("textStyle").fontSize as string) || "16px";
      setCurrentFontSize(size);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    // Initial check
    updateFontSize();

    // Subscribe to updates
    editor.on("transaction", updateFontSize);
    editor.on("selectionUpdate", updateFontSize);

    return () => {
      editor.off("transaction", updateFontSize);
      editor.off("selectionUpdate", updateFontSize);
    };
  }, [editor, updateFontSize]);

  const setFontSize = useCallback(
    (size: string) => {
      if (editor) {
        editor.chain().focus().setFontSize(size).run();
      }
    },
    [editor],
  );

  const unsetFontSize = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetFontSize().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          aria-label="Font size"
          tooltip="Font size"
          className="w-[80px] justify-between"
        >
          <span className="truncate">{currentFontSize}</span>
          <ChevronDownIcon className="tiptap-button-dropdown-small ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="h-[300px] overflow-y-auto">
        <Card>
          <CardBody>
            <ButtonGroup className="flex-col items-start w-full gap-0">
               <DropdownMenuItem asChild>
                  <Button
                    type="button"
                    data-style="ghost"
                    className="w-full justify-start font-normal"
                    data-active-state={!editor.getAttributes("textStyle").fontSize ? "on" : "off"}
                    onClick={unsetFontSize}
                  >
                    Default
                  </Button>
                </DropdownMenuItem>
              {fontSizes.map((size) => (
                <DropdownMenuItem key={size} asChild>
                  <Button
                    type="button"
                    data-style="ghost"
                    className="w-full justify-start font-normal"
                    data-active-state={currentFontSize === size ? "on" : "off"}
                    onClick={() => setFontSize(size)}
                  >
                    {size}
                  </Button>
                </DropdownMenuItem>
              ))}
            </ButtonGroup>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
