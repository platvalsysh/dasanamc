import React from "react";
import type Uppy from "@uppy/core";
import { useUppyState } from "@uppy/react";
import { X, FileText, AlertCircle } from "lucide-react";

interface UploadingFilesListProps {
  uppy: Uppy<any, any>;
  onCancel: (fileId: string) => void;
}

export function UploadingFilesList({
  uppy,
  onCancel,
}: UploadingFilesListProps) {
  // Get all files from Uppy state
  // We might filter out completed ones if we rely on the parent to remove them,
  // but to be safe/smooth, we can just render whatever is in Uppy.
  // The parent (SimpleEditor) is responsible for removing them from Uppy upon success to "move" them to FilesGrid.
  const files = useUppyState(uppy, (state) => Object.values(state.files));

  const removeFile = (fileId: string) => {
    onCancel(fileId);
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="uploading-files-list space-y-2 mb-4">
      {files.map((file) => {
        const isImage = file.type?.startsWith("image/");
        const progress = file.progress?.percentage ?? 0;
        const error = file.error;
        // We consider it "uploading" if it's in Uppy.
        // Even if 100%, if it's still in Uppy, it might be processing or waiting for parent to move it.

        return (
          <div
            key={file.id}
            className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100"
          >
            {/* Preview / Icon */}
            <div className="w-10 h-10 flex-shrink-0 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden">
              {isImage && file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="w-5 h-5 text-gray-400" />
              )}
            </div>

            {/* Info & Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <div className="text-sm font-medium text-gray-700 truncate pr-2">
                  {file.name}
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error ? (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Upload failed</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {progress === 100 ? "Processing..." : "Uploading..."}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        progress === 100 ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
