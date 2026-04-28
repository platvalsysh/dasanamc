import { useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Star,
  X,
  FileText,
  CheckCircle,
  ImagePlus,
  Trash2,
} from "lucide-react";

export interface ExistingFile {
  id: string;
  name: string;
  size: number;
  url?: string | null;
}

interface FilesGridProps {
  editor: Editor | null;
  existingFiles?: ExistingFile[];
  onRemoveExistingFiles?: (fileIds: string[]) => void;
  onSetMainThumbnail?: (fileId: string) => void;
  mainThumbnailId?: string | null;
}

export function FilesGrid({
  editor,
  existingFiles = [],
  onRemoveExistingFiles,
  onSetMainThumbnail,
  mainThumbnailId,
}: FilesGridProps) {
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(
    new Set(),
  );
  const lastSelectedId = useRef<string | null>(null);
  const touchTimer = useRef<NodeJS.Timeout | null>(null);

  if (existingFiles.length === 0) {
    return null;
  }

  const toggleSelection = (id: string, multi: boolean, range: boolean) => {
    const newSelection = new Set(multi ? selectedFileIds : []);

    if (
      range &&
      lastSelectedId.current &&
      existingFiles.some((f) => f.id === lastSelectedId.current)
    ) {
      const idx1 = existingFiles.findIndex(
        (f) => f.id === lastSelectedId.current,
      );
      const idx2 = existingFiles.findIndex((f) => f.id === id);
      const start = Math.min(idx1, idx2);
      const end = Math.max(idx1, idx2);

      for (let i = start; i <= end; i++) {
        newSelection.add(existingFiles[i].id);
      }
    } else {
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
    }

    lastSelectedId.current = id;
    setSelectedFileIds(newSelection);
  };

  const handleInsert = (fileId: string) => {
    const file = existingFiles.find((f) => f.id === fileId);
    if (file && file.url) {
      editor
        ?.chain()
        .focus()
        .setImage({ src: file.url, alt: file.name })
        .createParagraphNear() // Add a new paragraph after image
        .run();
    }
  };

  const handleBulkInsert = () => {
    const filesToInsert = existingFiles.filter((f) => selectedFileIds.has(f.id));
    if (editor && filesToInsert.length > 0) {
      let chain = editor.chain().focus();
      for (const file of filesToInsert) {
        if (file.url) {
          chain = chain
            .setImage({ src: file.url, alt: file.name })
            .createParagraphNear(); // Add a new paragraph after each image
        }
      }
      chain.run();
    }
    setSelectedFileIds(new Set());
  };

  const handleBulkDelete = () => {
    if (onRemoveExistingFiles) {
      onRemoveExistingFiles(Array.from(selectedFileIds));
      setSelectedFileIds(new Set());
    }
  };

  // Long press handling

  const handleTouchStart = (id: string) => {
    touchTimer.current = setTimeout(() => {
      // Long press trigger
      toggleSelection(id, true, false);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }
  };

  return (
    <div className="files-grid relative">
      {/* Floating Toolbar */}
      {selectedFileIds.size > 0 && (
        <div
          className="animate-in fade-in slide-in-from-top-2 absolute top-0 right-0 left-0 z-30 mx-auto mb-2 flex w-full max-w-md items-center justify-between rounded-lg border bg-white p-2 shadow-md"
          style={{ marginTop: "-3.5rem" }}
        >
          <div className="px-2 text-sm font-medium">
            {selectedFileIds.size} Selected
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1 rounded bg-red-100 p-1 px-3 text-xs text-red-600 hover:bg-red-200"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
            <button
              className="flex items-center gap-1 rounded bg-blue-100 p-1 px-3 text-xs text-blue-600 hover:bg-blue-200"
              onClick={handleBulkInsert}
            >
              <ImagePlus className="h-4 w-4" /> Insert
            </button>
            <button
              className="rounded p-1 px-2 text-gray-500 hover:bg-gray-100"
              onClick={() => setSelectedFileIds(new Set())}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {existingFiles.map((file) => {
        const isSelected = selectedFileIds.has(file.id);

        return (
          <div
            key={file.id}
            className={`file-card group relative ${isSelected ? "bg-blue-50 !ring-2 !ring-blue-500" : ""}`}
            onTouchStart={() => handleTouchStart(file.id)}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => {
              // Always toggle selection (multi-select mode behavior)
              toggleSelection(file.id, true, e.shiftKey);
            }}
          >
            <div className="file-preview">
              {file.url ? (
                <img src={file.url} alt={file.name} className="file-image" />
              ) : (
                <div className="file-icon-placeholder">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              )}

              {/* Overlay Actions: Only show if NOT selecting */}
              {!isSelected && selectedFileIds.size === 0 && (
                <button
                  type="button"
                  className="remove-button absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveExistingFiles?.([file.id]);
                  }}
                  title="Remove file"
                >
                  <X className="h-3 w-3" />
                </button>
              )}

              {/* Set Thumbnail Action (for images) - Restored to Top-Left */}
              {!isSelected &&
                selectedFileIds.size === 0 &&
                file.url &&
                onSetMainThumbnail && (
                  <button
                    type="button"
                    className={`thumbnail-button absolute top-1 left-1 rounded-full p-1 ${
                      mainThumbnailId === file.id
                        ? "bg-yellow-400 text-white"
                        : "bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetMainThumbnail(file.id);
                    }}
                    title="Set as Main Thumbnail"
                  >
                    <Star
                      className={`h-3 w-3 ${mainThumbnailId === file.id ? "fill-current" : ""}`}
                    />
                  </button>
                )}
            </div>

            <div className="file-info flex items-center justify-between p-2">
              <div
                className="file-name flex min-w-0 flex-1 items-center gap-1 text-xs"
                title={file.name}
              >
                <CheckCircle
                  className={`h-3 w-3 flex-shrink-0 ${isSelected ? "text-blue-500" : "text-green-500"}`}
                />
                <span className="truncate">{file.name}</span>
              </div>

              {/* Insert Action in Footer - Single */}
              {!isSelected && selectedFileIds.size === 0 && file.url && (
                <button
                  type="button"
                  className="insert-button-footer ml-2 rounded p-1 text-gray-600 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInsert(file.id);
                  }}
                  title="Insert into content"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
