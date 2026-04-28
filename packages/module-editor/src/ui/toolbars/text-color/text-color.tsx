import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { Palette } from "lucide-react";
import { Button } from "../../../../components/tiptap-ui-primitive/button/button";

interface TextColorToolbarProps {
  editor: Editor | null;
  isMarkdownMode?: boolean;
}

const colors = [
  "#000000",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#F3F4F6",
  "#DC2626",
  "#EA580C",
  "#D97706",
  "#CA8A04",
  "#65A30D",
  "#16A34A",
  "#059669",
  "#0891B2",
  "#0284C7",
  "#2563EB",
  "#4F46E5",
  "#7C3AED",
  "#9333EA",
  "#C026D3",
  "#DB2777",
  "#E11D48",
];

export function TextColorToolbar({
  editor,
  isMarkdownMode,
}: TextColorToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!editor) return null;

  const onToggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };

  const onSetTextColor = (color: string) => {
    if (color === "") {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
    setShowColorPicker(false);
  };

  return (
    <div className="color-picker-container relative">
      <Button
        data-style="ghost"
        onClick={onToggleColorPicker}
        disabled={isMarkdownMode}
        tooltip="텍스트 색상"
      >
        <Palette className="w-4 h-4" />
      </Button>

      {showColorPicker && (
        <div className="color-picker absolute top-full left-0 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
          <div className="color-grid grid grid-cols-6 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onSetTextColor(color)}
                className="color-button w-7 h-7 border border-gray-200 rounded cursor-pointer transition-transform hover:scale-110 hover:border-gray-400"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <button
              type="button"
              onClick={() => onSetTextColor("")}
              className="color-button color-button-reset w-7 h-7 border border-gray-200 rounded cursor-pointer transition-transform hover:scale-110 hover:border-gray-400 bg-white flex items-center justify-center text-sm font-bold text-gray-500 hover:bg-gray-50"
              title="기본 색상"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
