import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  GripVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Settings,
} from "lucide-react";
// Or standard html button

export const ResizableImage = (props: NodeViewProps) => {
  const { node, updateAttributes, selected, editor } = props;
  const { src, alt, width, height } = node.attrs;

  const [resizing, setResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width || "auto");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Temporary state for settings inputs
  const [tempWidth, setTempWidth] = useState(width || "");
  const [tempHeight, setTempHeight] = useState(height || "");

  const imgRef = useRef<HTMLImageElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Sync state with attributes
  useEffect(() => {
    setCurrentWidth(width || "auto");
    setTempWidth(width || "");
    setTempHeight(height || "");
  }, [width, height]);

  // Force update to reflect editor state changes (like alignment)
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      if (selected) {
        forceUpdate((prev) => prev + 1);
      }
    };

    editor.on("transaction", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);

    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, selected]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (imgRef.current) {
      setResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = imgRef.current.offsetWidth;

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const diff = e.clientX - startXRef.current;

    // Simple resize logic: standard drag extends width
    const newWidth = startWidthRef.current + diff;
    if (newWidth > 50) {
      setCurrentWidth(`${newWidth}px`);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    setResizing(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    if (imgRef.current) {
      updateAttributes({ width: imgRef.current.style.width });
    }
  }, [updateAttributes]);

  const handleAlign = (newAlign: string) => {
    editor.chain().focus().setTextAlign(newAlign).run();
  };

  const handleApplySettings = () => {
    updateAttributes({ width: tempWidth, height: tempHeight });
    setIsSettingsOpen(false);
  };

  const isAlignActive = (align: string) =>
    editor.isActive({ textAlign: align });

  return (
    <NodeViewWrapper className="resizable-image-node-view inline-block relative leading-none">
      <div
        className={`image-container group relative inline-block ${selected ? "ring-2 ring-indigo-500 rounded-sm" : ""}`}
      >
        {/* Toolbar - Visible on Hover/Selected */}
        {(selected || resizing) && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-white/90 shadow-sm border rounded-md p-1 backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => handleAlign("left")}
              className={`p-1 rounded hover:bg-gray-100 ${isAlignActive("left") ? "text-indigo-600" : "text-gray-600"}`}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleAlign("center")}
              className={`p-1 rounded hover:bg-gray-100 ${isAlignActive("center") ? "text-indigo-600" : "text-gray-600"}`}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleAlign("right")}
              className={`p-1 rounded hover:bg-gray-100 ${isAlignActive("right") ? "text-indigo-600" : "text-gray-600"}`}
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleAlign("justify")}
              className={`p-1 rounded hover:bg-gray-100 ${isAlignActive("justify") ? "text-indigo-600" : "text-gray-600"}`}
            >
              <AlignJustify className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-1 rounded hover:bg-gray-100 ${isSettingsOpen ? "text-indigo-600 bg-gray-100" : "text-gray-600"}`}
              >
                <Settings className="w-4 h-4" />
              </button>
              {/* Settings Popup */}
              {isSettingsOpen && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-lg rounded-lg p-3 w-48 z-[60]">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 w-10">W</label>
                      <input
                        type="text"
                        className="flex-1 border rounded px-1 py-0.5 text-xs"
                        value={tempWidth}
                        onChange={(e) => setTempWidth(e.target.value)}
                        placeholder="auto"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 w-10">H</label>
                      <input
                        type="text"
                        className="flex-1 border rounded px-1 py-0.5 text-xs"
                        value={tempHeight}
                        onChange={(e) => setTempHeight(e.target.value)}
                        placeholder="auto"
                      />
                    </div>
                    <button
                      className="w-full bg-indigo-500 text-white text-xs py-1 rounded hover:bg-indigo-600 mt-1"
                      onClick={handleApplySettings}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <img
          ref={imgRef}
          src={src}
          alt={alt}
          style={{
            width: currentWidth,
            height: height || "auto",
            maxWidth: "100%",
            display: "block",
          }}
          className="rounded-md"
        />

        {/* Resize Handle - More stylish */}
        <div
          className={`absolute bottom-2 right-2 flex items-center justify-center p-1 bg-white/80 border border-gray-200 rounded-md cursor-ew-resize shadow-sm opacity-0 group-hover:opacity-100 transition-opacity ${resizing ? "opacity-100" : ""}`}
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="w-3 h-3 text-gray-500" />
        </div>

        {/* Overlay for resizing state */}
        {resizing && (
          <div className="absolute inset-0 z-50 bg-transparent cursor-ew-resize" />
        )}
      </div>
    </NodeViewWrapper>
  );
};
